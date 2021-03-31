export enum LOGIN_TYPES {
    FACEBOOK = 0,
    GOOGLE = 1,
    API = 99,
    ZOOM = 100,
    SSO = 101
}

export enum USER_TYPE {
    BASIC = 1,
    LICENSED = 2,
    ON_PREM = 3
}

export enum MEETING_EVENTS {
    MEETING_CREATED = "meeting.created",
    MEETING_STARTED = "meeting.started"
}

export enum RECORDING_EVENTS {
    RECORDING_COMPLETED = "recording.completed"
}