export interface RECORDING_DATA {
    download_token: string;
    payload : {
        object : {
            recording_files: {
                download_url: string;
                file_size: string;
                recording_end: string;
                id: string;
            }[];
            topic: string;
            host_id: string;
        }
    }
}