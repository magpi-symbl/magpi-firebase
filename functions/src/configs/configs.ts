/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
import * as functions from "firebase-functions";

const firebase_config = functions.config();

const symbl_url = firebase_config.symbl.symbl_url;
const token_path = firebase_config.symbl.token_path;

export const app_id = firebase_config.symbl.app_id;
export const app_secret = firebase_config.symbl.app_secret;

export const token_generate_url = symbl_url + token_path;