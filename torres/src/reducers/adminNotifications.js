import { RECEIVED_ADNOT_DATA_SUCCESS, RECEIVING_ADNOT_DATA } from '../actions/adminNotifications';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_ADNOT_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_ADNOT_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
