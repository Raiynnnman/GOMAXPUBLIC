import { RECEIVED_ODTRAF_DATA_SUCCESS, RECEIVING_ODTRAF_DATA } from '../actions/onlineDemoTraffic';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_ODTRAF_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_ODTRAF_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
