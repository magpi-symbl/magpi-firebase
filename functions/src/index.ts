import * as functions from "firebase-functions";
import * as configs from './configs/configs';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const fetchAccessToken = functions.https.onRequest((request, response) => {
    functions.logger.info("fetchAccessToken request from UI", request.body);
    functions.logger.info("The appId being used is ", configs.app_id);
});
