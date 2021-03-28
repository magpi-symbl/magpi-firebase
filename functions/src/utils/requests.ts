import axios from 'axios';

export const get = (url: string, params: object, headers: object | null = null ) => {
    return axios.get(url, {params: params, headers:headers});
}

export const post = (url: string, body: any, params: object | null = null, headers: object | null = null) => {
    return axios.post(url, body, {params: params, headers: headers});
}