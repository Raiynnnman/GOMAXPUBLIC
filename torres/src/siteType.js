import config from './runtime-config';
export const siteType = function() {
    return process.env['REACT_APP_BASE_SITE_TYPE'] ? process.env['REACT_APP_BASE_SITE_TYPE'] : config['REACT_APP_BASE_SITE_TYPE'];
}

export default siteType;
