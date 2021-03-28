import * as functions from "firebase-functions";
import Transcripts from "../models/Transcripts";
import { v4 } from 'uuid';

import { FIRESTORE, IN_PROGRESS, TRANSCRIPTS_COLLECTION, ZOOM_MEETING_SOURCE, ZOOM_USER_COLLECTION } from "../constants/constants";


const { sdk } = require("symbl-node");
import * as configs from "../configs/configs";
import { SYMBL_PRODUCTION_URL } from "../constants/constants";

export const telephony = async (meetingName: string, emailAddress: string, meetingId: string, password: string, operatorId: string) => {
    const phoneNumber = "+16468769923"; // US Zoom Numbers are "+16465588656", or "+14086380968".
    functions.logger.info("Joining meeting with meetingName " + meetingName + " email " + emailAddress + " meetingId " + meetingId + " password " + password );
    const ZOOM_MEETING_ID = meetingId;
    const ZOOM_PARTICIPANT_ID = "";
    const ZOOM_MEETING_PASSCODE = password;

    let dtmfSequence = `${ZOOM_MEETING_ID}#`;

    if (ZOOM_PARTICIPANT_ID) {
    dtmfSequence += `,,${ZOOM_PARTICIPANT_ID}#`;
    } else {
    dtmfSequence += `,,#`;
    }

    if (ZOOM_MEETING_PASSCODE) {
    dtmfSequence += `,,${ZOOM_MEETING_PASSCODE}#`;
    }

    let {app_id, app_secret} = configs;

    sdk.init({
        appId: app_id,
        appSecret: app_secret,
        basePath: SYMBL_PRODUCTION_URL,
    }).then(async () => {
        functions.logger.info('SDK initialized.');
        try {
    
            sdk.startEndpoint({
                endpoint: {
                    type: "pstn",
                    phoneNumber: phoneNumber,
                    dtmf: dtmfSequence,
                },
                actions: [
                    {
                        invokeOn: "stop",
                        name: "sendSummaryEmail",
                        parameters: {
                            emails: [
                                emailAddress
                            ],
                        },
                    },
                ],
                data: {
                    session: {
                        name: meetingName,
                    },
                },
            }).then((connection: {connectionId: string, conversationId: string}) => {

                let meetingDetails = FIRESTORE.collection(ZOOM_USER_COLLECTION).where("zoomId", "==", operatorId).get();
                meetingDetails.then((details) => {
                    functions.logger.info("These are the zoom user details", {details, details_docs: details.docs, details_docs_data: details.docs[0].data()});
                    let transcriptPayload : Transcripts = {
                        transcriptId: v4(),
                        userId: details.docs[0]?.data()?.googleUserId || "", //find UserId using join condition,
                        conversationId: connection.conversationId,
                        jobId: connection.connectionId,
                        status: IN_PROGRESS,
                        videoUrl: '',
                        created_date: Date.now(),
                        updated_date: Date.now(),
                        fileName: meetingName,
                        fileSize: '0 MBs',
                        source: ZOOM_MEETING_SOURCE,
                        fileType: ''

                    }    
                    FIRESTORE.collection(TRANSCRIPTS_COLLECTION).doc( transcriptPayload.transcriptId).set(transcriptPayload);

                })

                const connectionId = connection.connectionId;
                functions.logger.info("Successfully connected.", connectionId);
                functions.logger.info('Conversation ID', connection.conversationId);
                functions.logger.info('Full Conection Object', connection);
                functions.logger.info("Calling into Zoom now, please wait about 30-60 seconds.");
            })
                .catch((err: Error) => {
                    functions.logger.error("Error while starting the connection", err);
                });
        } catch (e) {
            functions.logger.error(e);
        }
    }).catch((err: Error) => functions.logger.error('Error in SDK initialization.', err));
}