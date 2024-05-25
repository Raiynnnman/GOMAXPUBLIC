import config from './runtime-config';
export const baseURLConfig = function() {
    return process.env['REACT_APP_BASE_URL'] ? process.env['REACT_APP_BASE_URL'] : config['REACT_APP_BASE_URL'];
}

export default baseURLConfig;
