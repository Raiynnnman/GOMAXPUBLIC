import axios from "axios";
import baseURLConfig from './baseURLConfig';

axios.defaults.headers.common['UI'] = "2";
axios.defaults.headers.common['TIMEZONE'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
axios.defaults.baseURL = baseURLConfig();
axios.defaults.headers.common['Content-Type'] = "application/json";
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;
}

const instance = axios.create({
    // baseURL: import.meta.env.VITE_API_ENDPOINT,
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token"
    }
});
export default instance
