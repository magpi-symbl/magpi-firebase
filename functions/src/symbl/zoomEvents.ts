import * as functions from "firebase-functions";
import { REALTIME_DB, ZOOM_MEETINGS_COLLECTION } from "../constants/constants";
import { MEETING_EVENTS } from "../constants/zoomEnum";
import ZOOM_MEETING_PAYLOAD from "../models/ZoomMeetingPayload";
import { telephony } from "./telephony";

const express = require('express');
const app = express();

app.post('/', async (req: functions.https.Request, res:functions.Response<any>) => {
    functions.logger.info("Zoom events URL hit", req.body);
    
    if(req.body.event === MEETING_EVENTS.MEETING_CREATED){
        saveMeetingCredentials(req.body.payload.object.uuid, req.body.payload.object.topic, req.body.payload.operator, req.body.payload.object.id, req.body.payload.object.password)
    } else if(req.body.event === MEETING_EVENTS.MEETING_STARTED){
        let meetingDocs = await REALTIME_DB.ref(ZOOM_MEETINGS_COLLECTION).child(req.body.payload.object.id).get();
        
        if(!meetingDocs.exists){
            functions.logger.error("Meeting does not exist with meetingId " + req.body.payload.object.id);
            res.status(200).send();
            return;
        }

        let meetingCredentials : any = meetingDocs.toJSON();
        if(meetingCredentials !== null){
            telephony(meetingCredentials.meetingName, meetingCredentials.emailAddress, meetingCredentials.meetingId, meetingCredentials.password, req.body.payload.operator_id);
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

export const zoomEvents = functions.https.onRequest(app);