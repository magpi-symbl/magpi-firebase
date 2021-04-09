/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
import * as functions from "firebase-functions";

const firebase_config = functions.config();

const symbl_url = firebase_config.magpie.symbl_url;
const token_path = firebase_config.magpie.token_path;

export const app_id = firebase_config.magpie.app_id;
export const app_secret = firebase_config.magpie.app_secret;

export const token_generate_url = symbl_url + token_path;

export const zoom_username = firebase_config.zoom.username;
export const zoom_password = firebase_config.zoom.password;