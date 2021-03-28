import * as admin from 'firebase-admin';

const app = admin.initializeApp();

export const FIRESTORE = app.firestore();
export const REALTIME_DB = app.database();

export const IN_PROGRESS = 'in_progress';
export const COMPLETED = 'completed';

export const SYMBL_PRODUCTION_URL = "https://api.symbl.ai";

export const SYMBL_AUTHENTICATION_TYPE = "application";

export const ZOOM_MEETING_SOURCE = 'zoom';

export const ZOOM_REDIRECT_URI = 'https://chappie-dev.web.app/zoom-integrations';
export const ZOOM_USER_COLLECTION = 'zoom_users';
export const ZOOM_MEETINGS_COLLECTION = 'meetings';
export const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
export const ZOOM_USER_FETCH_URL = 'https://api.zoom.us/v2/users/{userId}';

export const AUTHORIZATION_CODE = 'authorization_code';

export const TRANSCRIPTS_COLLECTION = 'transcripts';