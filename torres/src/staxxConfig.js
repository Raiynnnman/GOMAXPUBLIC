import config from './runtime-config';
export const staxxKey = function() {
    return process.env['REACT_APP_STAXX_KEY'] ? process.env['REACT_APP_STAXX_KEY'] : config['REACT_APP_STAXX_KEY']
} 

export default staxxKey;
