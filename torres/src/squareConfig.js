
import config from './runtime-config';
export const squareAppKey = function() {
    return process.env['REACT_APP_SQUARE_APP_KEY'] ? process.env['REACT_APP_SQUARE_APP_KEY'] : config['REACT_APP_SQUARE_APP_KEY'];
}

export const squareLocationKey = function() { 
    return process.env['REACT_APP_SQUARE_LOCATION_KEY'] ? process.env['REACT_APP_SQUARE_LOCATION_KEY'] : config['REACT_APP_SQUARE_LOCATION_KEY']
}

export const squareApiKey = function() {
    return process.env['REACT_APP_SQUARE_API_KEY'] ? process.env['REACT_APP_SQUARE_API_KEY'] : config['REACT_APP_SQUARE_API_KEY']
}

export default squareAppKey;
