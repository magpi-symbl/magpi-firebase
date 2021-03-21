import 'axios';
import axios from 'axios';

export const get = (url: string, params: object ) => {
    return axios.get(url, {params: params});
}

export const post = (url: string, body: any, params: object) => {
    return axios.post(url, body, {params: params});
}