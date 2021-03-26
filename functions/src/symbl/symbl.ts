
import * as functions from "firebase-functions";
import * as configs from "../configs/configs";

const { sdk } = require("symbl-node");

const appId = configs.app_id;
const appSecret =  configs.app_secret;

const express = require('express');

const app = express();

app.post('/', (req: functions.https.Request, res:functions.Response<any>) => {
    functions.logger.info("Zoom events URL hit", req.body);
    if(req.body.event === "meeting.created" && req.body.payload.object.type === 1){
        telephony(req.body.payload.object.topic, req.body.payload.operator, req.body.payload.object.id, req.body.payload.object.password);
    }
    res.status(200).send("Function Triggered!");
});


const telephony = async (meetingName: string, emailAddress: string, meetingId: string, password: string) => {
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


    sdk.init({
        appId: appId,
        appSecret: appSecret,
        basePath: "https://api.symbl.ai",
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

export const zoomEvents = functions.https.onRequest(app);