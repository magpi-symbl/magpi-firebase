import * as functions from "firebase-functions";
import { FIRESTORE, TRANSCRIPTS_COLLECTION} from "../constants/constants";

const express = require('express');
const app = express();

const cors = require('cors')({
    origin: true
  });

app.use(cors);

app.post('/', async (req: functions.https.Request, res:functions.Response<any>) => {
    functions.logger.info("Symbl Callback hit", req.body);
    FIRESTORE.collection(TRANSCRIPTS_COLLECTION).where("jobId", "==", req.body.id).get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => doc.ref.set({status: req.body.status}, {merge: true}));
  })
  return res.status(200).send();
});

export const symblCallback = functions.https.onRequest(app);