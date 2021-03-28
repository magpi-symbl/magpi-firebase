import { zoom_password, zoom_username } from "../configs/configs";

export interface ZoomAuthenticationPayload {
    grant_type: string;
    code: string;
    redirect_uri: string;
}

export const fetchBasicCredentials = () => {
    return Buffer.from(zoom_username + ":" + zoom_password).toString('base64');
}
