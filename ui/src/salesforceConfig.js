
export const salesforceURL = function() {
    console.log("env",process.env);
    return process.env['SALESFORCE_URL']
}

export default salesforceURL;
