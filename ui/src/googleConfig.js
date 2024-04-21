
import config from './runtime-config';
export const googleKey = function() {
    return process.env['REACT_APP_GOOGLE_API_KEY'] ? process.env['REACT_APP_GOOGLE_API_KEY'] : config['REACT_APP_GOOGLE_API_KEY']
}

export default googleKey;
