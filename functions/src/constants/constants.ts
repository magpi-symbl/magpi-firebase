import * as admin from 'firebase-admin';
import { app_base_url, cloud_base_url, gcp_bucket } from '../configs/configs';

const app = admin.initializeApp();

export const FIRESTORE = app.firestore();
export const REALTIME_DB = app.database();
export const FIREBASE_STORAGE = app.storage();

export const IN_PROGRESS = 'in_progress';
export const COMPLETED = 'completed';

export const SYMBL_PRODUCTION_URL = "https://api.symbl.ai";
export const SYMBL_EXPERIENCES_URL = "https://api.symbl.ai/v1/conversations/{conversationId}/experiences";
export const SYMBL_VIDEO_URL = "https://api.symbl.ai/v1/process/video/url";
export const SYMBL_AUTHENTICATION_TYPE = "application";

export const ZOOM_MEETING_SOURCE = 'zoom';

export const WEBHOOK_URL_FOR_SYMBL = cloud_base_url+ "/symblCallback";

export const ZOOM_REDIRECT_URI = app_base_url+'/zoom-integrations';
export const ZOOM_USER_COLLECTION = 'zoom_users';
export const ZOOM_MEETINGS_COLLECTION = 'meetings';
export const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
export const ZOOM_USER_FETCH_URL = 'https://api.zoom.us/v2/users/{userId}';
export const ZOOM_USER_SETTINGS_PATCH_URL = 'https://api.zoom.us/v2/users/{userId}/settings';

export const AUTHORIZATION_CODE = 'authorization_code';

export const TRANSCRIPTS_COLLECTION = 'transcripts';
export const BUCKET_NAME = gcp_bucket