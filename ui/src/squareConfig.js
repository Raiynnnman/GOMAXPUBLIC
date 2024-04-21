
export const squareAppKey = function() {
    return process.env['REACT_APP_SQUARE_APP_KEY'];
}

export const squareLocationKey = function() { 
    console.log("env",process.env);
    return process.env['REACT_APP_SQUARE_LOCATION_KEY'];
}

export const squareApiKey = function() {
    return process.env['REACT_APP_SQUARE_API_KEY'];
}

export default squareAppKey;
