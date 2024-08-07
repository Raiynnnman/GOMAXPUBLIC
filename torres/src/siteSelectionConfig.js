
import config from './runtime-config';
export const envConfig = function(e) {
    console.log("env",e);
    if (e === "patient") { 
        return process.env['REACT_APP_SITE_CUSTOMER_URL'] ? process.env['REACT_APP_SITE_CUSTOMER_URL'] : config['REACT_APP_SITE_CUSTOMER_URL']
    } 
    if (e === "legal") { 
        return process.env['REACT_APP_SITE_LEGAL_URL'] ? process.env['REACT_APP_SITE_LEGAL_URL'] : config['REACT_APP_SITE_LEGAL_URL']
    } 
    if (e === "provider") { 
        return process.env['REACT_APP_SITE_PROVIDER_URL'] ? process.env['REACT_APP_SITE_PROVIDER_URL'] : config['REACT_APP_SITE_PROVIDER_URL']
    } 
} 

export default envConfig;
