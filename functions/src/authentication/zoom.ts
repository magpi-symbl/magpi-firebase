import * as functions from "firebase-functions";
import { AUTHORIZATION_CODE, FIRESTORE, ZOOM_REDIRECT_URI, ZOOM_TOKEN_URL, ZOOM_USER_COLLECTION, ZOOM_USER_FETCH_URL } from "../constants/constants";
import { fetchBasicCredentials, ZoomAuthenticationPayload } from "../models/ZoomAuthenticationPayload";
import { USER_PAYLOAD } from "../models/ZoomUserPayload";
import { post, get } from "../utils/requests";

import jwtDecode from 'jwt-decode';

const express = require('express');

const app = express();

app.post('/', async (req: functions.https.Request, res:functions.Response<any>) => {
    functions.logger.info("Fetch Zoom User Details URL hit", req.body);

    let zoomPayload : ZoomAuthenticationPayload = {
        code: req.body.token,
        grant_type: AUTHORIZATION_CODE,
        redirect_uri: ZOOM_REDIRECT_URI
    };

    let userId = "";
    let accessToken = "";

    try {
        let zoomAccessTokenDetails = await post(ZOOM_TOKEN_URL, {}, zoomPayload, {'Authorization' : 'Basic ' + fetchBasicCredentials()});
        functions.logger.info("The response for zoom access token is", zoomAccessTokenDetails.data);
        accessToken = zoomAccessTokenDetails.data.access_token;
        functions.logger.info("Zoom Access token " + accessToken);
        let decodedValue : {uid: string} = jwtDecode(accessToken);
        functions.logger.info("decoded accessToken ", decodedValue);
        userId = decodedValue.uid;
    } catch (error) {
        functions.logger.error("Could not fetch accessToken", error);
        res.status(400).send({"message": "Token has expired"});
        return;
    }


    
    get(`${ZOOM_USER_FETCH_URL.replace('{userId}', userId)}`, {}, {Authorization: 'Bearer ' + accessToken}).then((response) => {
        functions.logger.info("The response from zoom is ", response);
        
        let {first_name, last_name, email, login_types, type, id} = response.data;
        
        let zoomUserDetails : USER_PAYLOAD = {
            name: first_name + " " + last_name,
            email: email,
            loginTypes: login_types,
            type: type,
            zoomId: id,
            googleUserId: req.body.googleUserId
        }

        FIRESTORE.collection(ZOOM_USER_COLLECTION).doc(id).set(zoomUserDetails);
        res.status(200).send({zoomUserId: id});
        
    }).catch(error => {
        functions.logger.error("Error occured while fetching user details ", error);
        res.status(500).send({message: "Error occured while fetching user details!"});
    })
});


export const fetchZoomUserDetails = functions.https.onRequest(app);