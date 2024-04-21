
import config from './runtime-config';
export const salesforceURL = function() {
    return process.env['REACT_APP_SALESFORCE_URL'] ?process.env['REACT_APP_SALESFORCE_URL']: config['REACT_APP_SALESFORCE_URL']
}

export default salesforceURL;
