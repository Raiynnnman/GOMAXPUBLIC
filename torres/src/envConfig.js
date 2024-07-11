
import config from './runtime-config';
export const envConfig = function() {
    return process.env['REACT_APP_DEPLOY_ENV'] ? process.env['REACT_APP_DEPLOY_ENV'] : config['REACT_APP_DEPLOY_ENV']
} 

export default envConfig;
