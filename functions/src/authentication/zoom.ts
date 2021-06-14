import * as functions from "firebase-functions";
import { AUTHORIZATION_CODE, FIRESTORE, ZOOM_REDIRECT_URI, ZOOM_TOKEN_URL, ZOOM_USER_COLLECTION, ZOOM_USER_FETCH_URL, ZOOM_USER_SETTINGS_PATCH_URL } from "../constants/constants";
import { fetchBasicCredentials, ZoomAuthenticationPayload } from "../models/ZoomAuthenticationPayload";
import { USER_PAYLOAD } from "../models/ZoomUserPayload";
import { post, get, patch } from "../utils/requests";

import jwtDecode from 'jwt-decode';

const cors = require('cors')({
    origin: true
});

const express = require('express');

const app = express();

app.use(cors);

app.post('/', async (req: functions.https.Request, res: functions.Response<any>) => {
    functions.logger.info("Fetch Zoom User Details URL hit", req.body);

    let zoomPayload: ZoomAuthenticationPayload = {
        code: req.body.token,
        grant_type: AUTHORIZATION_CODE,
        redirect_uri: ZOOM_REDIRECT_URI
        // redirect_uri: 'http://localhost:3000/zoom-integrations' //currently uploaded
    };

    let userId = "";
    let accessToken = "";

    try {
        let zoomAccessTokenDetails = await post(ZOOM_TOKEN_URL, {}, zoomPayload, { 'Authorization': 'Basic ' + fetchBasicCredentials() });
        accessToken = zoomAccessTokenDetails.data.access_token;
        let decodedValue: { uid: string } = jwtDecode(accessToken);
        userId = decodedValue.uid;
    } catch (error) {
        functions.logger.error("Could not fetch accessToken response = ", error.response);
        functions.logger.error("Could not fetch accessToken data = ", error.data);
        res.status(400).send({ "message": "Token has expired" });
        return;
    }

    patch(`${ZOOM_USER_SETTINGS_PATCH_URL.replace('{userId}', userId)}`, getDefaultRecordingPayload(), getZoomApiHeader(accessToken)).then((data) => {
        functions.logger.info("Successfully updated recording setting for user " + userId, data);
    }).catch((error) => {
        functions.logger.error("Error while updating recording settings for user " + userId, error);
    })

    get(`${ZOOM_USER_FETCH_URL.replace('{userId}', userId)}`, {}, getZoomApiHeader(accessToken)).then((response) => {
        functions.logger.info("The response from zoom is ", response);

        let { first_name, last_name, email, login_types, type, id } = response.data;

        let zoomUserDetails: USER_PAYLOAD = {
            name: first_name + " " + last_name,
            email: email,
            loginTypes: login_types,
            type: type,
            zoomId: id,
            googleUserId: req.body.googleUserId
        }

        FIRESTORE.collection(ZOOM_USER_COLLECTION).doc(id).set(zoomUserDetails);
        res.status(200).send({ zoomUserId: id });

    }).catch(error => {
        functions.logger.error("Error occured while fetching user details ", error);
        res.status(500).send({ message: "Error occured while fetching user details!" });
    })
});

const getDefaultRecordingPayload = () => {
    return {
        "recording": {
            "local_recording": true,
            "cloud_recording": true,
            "record_speaker_view": true,
            "record_gallery_view": false,
            "record_audio_file": true,
            "show_timestamp": false,
            "recording_audio_transcript": false,
            "auto_recording": "cloud",
            "auto_delete_cmr": false
        }
    }
}

const getZoomApiHeader = (accessToken: string) : object => {
    return { Authorization: 'Bearer ' + accessToken };
}


export const fetchZoomUserDetails = functions.https.onRequest(app);