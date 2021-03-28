/* eslint-disable camelcase */
/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as configs from "./configs/configs";

import {post} from "./utils/requests";
import { SYMBL_AUTHENTICATION_TYPE } from "./constants/constants";

const cors = require('cors')({
  origin: true,
});



export const fetchAccessToken = functions.https.onRequest((request, response) => {
  return cors(request, response, ()=> {
    functions.logger.info("fetchAccessToken request from UI", request.body);
  
    const token_generage_body = {
      type: SYMBL_AUTHENTICATION_TYPE,
      appId: configs.app_id,
      appSecret: configs.app_secret,
    };
  
    post(configs.token_generate_url, token_generage_body).then((respObj) => {
      response.status(200).send({token: respObj.data.accessToken});
    }).catch((err) => {
      functions.logger.error("Error occured while generating token ", err);
    });

  })
});

exports.zoomEvents = require('./symbl/zoomEvents').zoomEvents;
exports.fetchZoomUserDetails = require('./authentication/zoom').fetchZoomUserDetails;
exports.symblCallback = require('./symbl/symbl').symblCallback;