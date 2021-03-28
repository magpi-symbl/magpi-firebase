import * as functions from "firebase-functions";
import { FIRESTORE, TRANSCRIPTS_COLLECTION} from "../constants/constants";

const express = require('express');
const app = express();

app.post('/', async (req: functions.https.Request, res:functions.Response<any>) => {
    functions.logger.info("Zoom events URL hit", req.body);
    FIRESTORE.collection(TRANSCRIPTS_COLLECTION).where("jobId", "==", req.body.jobId).get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => doc.ref.set({status: req.body.status}, {merge: true}));
  })
  return res.status(200).send();
});

export const symblCallback = functions.https.onRequest(app);