import { RECEIVED_ODSTA_DATA_SUCCESS, RECEIVING_ODSTA_DATA } from '../actions/demoStart';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_ODSTA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_ODSTA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
