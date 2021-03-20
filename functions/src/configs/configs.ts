const firebase_config: { symbl_url: string, token_path: string, app_id: string, app_secret: string } = JSON.parse(process.env.FIREBASE_CONFIG || "");

const symbl_url = firebase_config.symbl_url;
const token_path = firebase_config.token_path;

export const app_id = firebase_config.app_id;
export const app_secret = firebase_config.app_secret;

export const token_generate_url = symbl_url + token_path;