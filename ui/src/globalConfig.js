
import config from './runtime-config';
export const apiBaseUrl = function() {
    return process.env['REACT_APP_API_BASE_URL'] ? process.env['REACT_APP_API_BASE_URL'] : config['REACT_APP_API_BASE_URL']
} 

export const contextURL = function() { 
    return "/index.html";
}

export default apiBaseUrl;
