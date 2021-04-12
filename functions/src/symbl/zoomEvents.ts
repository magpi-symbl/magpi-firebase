import nodeFetch from "node-fetch"
import * as functions from "firebase-functions";
import { v4 } from "uuid";
import { FIREBASE_STORAGE, FIRESTORE, IN_PROGRESS, REALTIME_DB, SYMBL_VIDEO_URL, TRANSCRIPTS_COLLECTION, WEBHOOK_URL_FOR_SYMBL, ZOOM_MEETINGS_COLLECTION, ZOOM_MEETING_SOURCE, ZOOM_USER_COLLECTION } from "../constants/constants";
import { MEETING_EVENTS, RECORDING_EVENTS } from "../constants/zoomEnum";
import { RECORDING_DATA } from "../models/RecordingData";
import Transcripts from "../models/Transcripts";
import ZOOM_MEETING_PAYLOAD from "../models/ZoomMeetingPayload";
import { get, post } from "../utils/requests";
import { generateToken } from "./generateToken";
import { telephony } from "./telephony";

const express = require('express');
const app = express();

const converters = require('./../converter/index');

app.post('/', async (req: functions.https.Request, res:functions.Response<any>) => {
    functions.logger.info("Zoom events URL hit", req.body);
    if(req.body.event === RECORDING_EVENTS.RECORDING_COMPLETED){
        analyzeRecordingFiles(req.body);
    } else if(req.body.event === MEETING_EVENTS.MEETING_CREATED){
        saveMeetingCredentials(req.body.payload.object.uuid, req.body.payload.object.topic, req.body.payload.operator, req.body.payload.object.id, req.body.payload.object.password)
    } else if(req.body.event === MEETING_EVENTS.MEETING_STARTED){
        let meetingDocs = await REALTIME_DB.ref(ZOOM_MEETINGS_COLLECTION).child(req.body.payload.object.id).get();
        let meetingOwner = await FIRESTORE.collection(ZOOM_USER_COLLECTION).doc(req.body.payload.object.host_id).get();

        if(!meetingDocs.exists){
            functions.logger.error("Meeting does not exist with meetingId " + req.body.payload.object.id);
            res.status(200).send();
            return;
        }

        if(!meetingOwner.exists){
            functions.logger.error("Owner of meeting not found in Database");
            res.send(200).send();
            return;
        }

        let meetingCredentials : any = meetingDocs.toJSON();
        let ownerDetails: any = meetingOwner.data();
        if(meetingCredentials !== null && ownerDetails.type === 1){
            telephony(meetingCredentials.meetingName, meetingCredentials.emailAddress, meetingCredentials.meetingId, meetingCredentials.password, req.body.payload.object.host_id);
        }
    }

    res.status(200).send("Function Triggered!");
});

const saveMeetingCredentials = async (uuid: string, meetingName: string, emailAddress: string, meetingId: string, password: string) => {
    let meetingDetails: ZOOM_MEETING_PAYLOAD = {
        meetingName,emailAddress,meetingId,password, uuid
    }

    REALTIME_DB.ref(ZOOM_MEETINGS_COLLECTION).child(meetingId).set(meetingDetails);
}

const analyzeRecordingFiles = async (recordingData: RECORDING_DATA) => {
    let downloadToken = recordingData.download_token;
    let videoRecordingFiles = recordingData.payload.object.recording_files.filter((recording : any) => recording.file_extension === "MP4");

    let speakerEventsFiles = recordingData.payload.object.recording_files.filter((recording: any) => recording.file_type === "TIMELINE");

    let downloadUrl = "";

    if(videoRecordingFiles.length === 1){
        downloadUrl += videoRecordingFiles[0].download_url;
    } else {
        functions.logger.error("Multiple or No Video file recording to be analyzed, hence aborting for recordingPayload ", recordingData);
        return;
    }
    let actualVideoUrl = "";
    let finalDownloadUrl = "";
    try{
        await get(downloadUrl, {access_token: downloadToken}, {}, {maxRedirects: 0});
    } catch(error) {
        if(error.response.status === 302){
            finalDownloadUrl = error.response.headers.location;
            functions.logger.info("error.response.headers.location " + error.response.headers);
        }
        functions.logger.info("Error occured while fetching recording url of Zoom Recording " + downloadUrl, error);
    }

    try{
        const file = await nodeFetch(finalDownloadUrl);
        actualVideoUrl = saveFileOnTranscriptBucket(file, videoRecordingFiles[0].id);
    } catch(error) {
        functions.logger.info("Error occured while fetching recording url of Zoom Recording " + finalDownloadUrl, error);
    }

    functions.logger.info("This is the final actualVideoUrl ", actualVideoUrl);

    if(actualVideoUrl.length > 0){
        let data = {
            "url": actualVideoUrl,
            "confidenceThreshold": 0.6,
            "timezoneOffset": 0,
            "webhookUrl" : WEBHOOK_URL_FOR_SYMBL,
            "channelMetadata": (await convertToChannelMetaData(speakerEventsFiles, downloadToken))?.speakerEvents
        };

        let headers = await getSymblHeader();

        let params = getSymblParams(speakerEventsFiles);

        let userDetails = (await FIRESTORE.collection(ZOOM_USER_COLLECTION).doc(recordingData.payload.object.host_id).get());

        post(SYMBL_VIDEO_URL, data, params, headers).then((response) => {
            let transcriptPayload : Transcripts = {
                transcriptId: v4(),
                userId: userDetails.data()?.googleUserId,
                conversationId: response.data.conversationId,
                jobId: response.data.jobId,
                status: IN_PROGRESS,
                videoUrl: actualVideoUrl,
                created_date: Date.now(),
                updated_date: Date.now(),
                fileName: `Recording of Meeting at ${videoRecordingFiles[0].recording_end.substring(0,10)}`,
                fileSize: `${videoRecordingFiles[0].file_size} B`,
                source: ZOOM_MEETING_SOURCE,
                fileType: 'mp4'
            }

            functions.logger.info(`Saving transcripts with transcriptId ${transcriptPayload.transcriptId} for conversationId ${transcriptPayload.conversationId}`);

            FIRESTORE.collection(TRANSCRIPTS_COLLECTION).doc(transcriptPayload.transcriptId).set(transcriptPayload)

        }).catch((error) => {
            functions.logger.error("Error occured while analyzing Video recording", error);
        })
    }
    
}

const getSymblHeader = async () => {
    let accessToken = (await generateToken()).data.accessToken;
    return {'x-api-key' : accessToken};
}

const getSymblParams = (speakerEventsFiles : any[]) => {
    if(!speakerEventsFiles || speakerEventsFiles.length === 0){
        return {
            enableSpeakerDiarization: true,
            diarizationSpeakerCount:2
        }
    } else {
        return {}
    }
}

const convertToChannelMetaData = async (speakerEventsFile: any[], downloadToken: string) => {

    if(speakerEventsFile.length === 1){
        const timeline = await getTimelineFile(speakerEventsFile, downloadToken);
        functions.logger.info("The timeline file to be found is ", timeline?.data);
        const zoomTimelineConverter = converters.getConverterByName(
            converters.getConverters().zoom,
            timeline?.data
        );
        
        const converted = await zoomTimelineConverter.convert();
        return converted;
    }
    functions.logger.info("No timeline file found", speakerEventsFile);
    return [];
}

const getTimelineFile = async (timelineFile: any[], downloadToken: string) => {
    functions.logger.info("THis is the file found", timelineFile);
    const download_url = timelineFile[0].download_url;
    try{
        return await get(download_url, {access_token: downloadToken});
    } catch(error) {
        functions.logger.error("Error occured while downloading timeline file", error);
        return;
    }
}

const saveFileOnTranscriptBucket = (response: any, fileName: string) => {

    // fs.writeFile(fileName + ".mp4", file, (err: any) => functions.logger.error("Error occured while saving file" , err));

    const fileToBeSaved = FIREBASE_STORAGE.bucket('transcript/video').file(fileName + ".mp4");

    const writeStream = fileToBeSaved.createWriteStream();

    functions.logger.info("WriteStream data is ", response.body);

    response.body.pipe(writeStream);
    response!.body!.on('error', (error: any) => {
        functions.logger.info("The stream has an error while saving file ", error);
    })
    response.body.on('finish', (data: any) => {
        functions.logger.info("The stream is closed ", data);
    });

    functions.logger.info("File saving on Bucket successfully");

    return FIREBASE_STORAGE.bucket('transcript/video').file(fileName + ".mp4").publicUrl();
}

export const zoomEvents = functions.https.onRequest(app);