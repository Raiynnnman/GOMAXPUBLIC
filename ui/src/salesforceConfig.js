
export const salesforceURL = function() {
    console.log("env",process.env);
    return process.env['REACT_APP_SALESFORCE_URL']
}

export default salesforceURL;
