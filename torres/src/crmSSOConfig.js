import config from './runtime-config';
export const crmSSOConfig = function() {
    return process.env['REACT_APP_CRM_SSO_CONFIG'] ? process.env['REACT_CRM_SSO_CONFIG'] : config['REACT_APP_CRM_SSO_CONFIG']
} 

export const contextURL = function() { 
    return "/index.html";
}

export default crmSSOConfig;
