import * as functions from "firebase-functions";
import Transcripts from "../models/Transcripts";
import { v4 } from 'uuid';

import { COMPLETED, FIRESTORE, TRANSCRIPTS_COLLECTION, ZOOM_MEETING_SOURCE, ZOOM_USER_COLLECTION } from "../constants/constants";


const { sdk } = require("symbl-node");
import * as configs from "../configs/configs";
import { SYMBL_PRODUCTION_URL } from "../constants/constants";

export const telephony = async (meetingName: string, emailAddress: string, meetingId: string, password: string, operatorId: string) => {
    const phoneNumber = "+16468769923"; // US Zoom Numbers are "+16465588656", or "+14086380968".
    functions.logger.info("Joining meeting with meetingName " + meetingName + " email " + emailAddress + " meetingId " + meetingId + " password " + password + " operatorId " + operatorId );
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
    }).then(() => {
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
            }).then(async (connection: {connectionId: string, conversationId: string}) => {

                    FIRESTORE.collection(ZOOM_USER_COLLECTION).doc(operatorId).get().then((details) => {
                        functions.logger.info("These are the zoom user details", {details_data: details.data()});
                        let transcriptPayload : Transcripts = {
                            transcriptId: v4(),
                            userId: details.data()?.googleUserId || "", //find UserId using join condition,
                            conversationId: connection.conversationId,
                            jobId: connection.connectionId,
                            status: COMPLETED,
                            videoUrl: '',
                            duration: '',
                            created_date: Date.now(),
                            updated_date: Date.now(),
                            fileName: meetingName,
                            fileSize: '0 MBs',
                            source: ZOOM_MEETING_SOURCE,
                            fileType: 'mp3'
                        }    

                        functions.logger.info("Transcript with id " + transcriptPayload.transcriptId + " saved for conversationId " + transcriptPayload.conversationId);

                        FIRESTORE.collection(TRANSCRIPTS_COLLECTION).doc(transcriptPayload.transcriptId).set(transcriptPayload);
                    })
                functions.logger.info('Conversation ID', connection.conversationId);
                functions.logger.info('Full Conection Object', connection);
            })
                .catch((err: Error) => {
                    functions.logger.error("Error while starting the connection", err);
                });
        } catch (e) {
            functions.logger.error(e);
        }
    }).catch((err: Error) => functions.logger.error('Error in SDK initialization.', err));
}