export interface Recording_Data {
    download_token: string;
    payload : {
        object : {
            recording_files: Recording_Files[];
            topic: string;
            host_id: string;
        }
    }
}

export interface Recording_Files {
    download_url: string;
    file_size: string;
    recording_start: string;
    recording_end: string;
    id: string;
}