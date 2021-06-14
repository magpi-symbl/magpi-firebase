/* eslint-disable camelcase */
/* eslint-disable max-len */
import * as functions from "firebase-functions";
import { generateToken } from "./symbl/generateToken";


const cors = require('cors')({
  origin: true,
});



export const fetchAccessToken = functions.https.onRequest((request, response) => {
  return cors(request, response, ()=> {
    functions.logger.info("fetchAccessToken request from UI", request.body);
  
    generateToken().then((respObj) => {
      console.log('generateToken:: response ==',respObj.data)
      response.status(200).send({token: respObj.data.accessToken});
    }).catch((err) => {
      functions.logger.error("Error occured while generating token ", err);
    });

  })
});

exports.zoomEvents = require('./symbl/zoomEvents').zoomEvents;
exports.fetchZoomUserDetails = require('./authentication/zoom').fetchZoomUserDetails;
exports.symblCallback = require('./symbl/symbl').symblCallback;