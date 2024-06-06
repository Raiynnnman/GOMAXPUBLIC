import { RECEIVED_SUBS_DATA_SUCCESS, RECEIVING_SUBS_DATA } from '../actions/subscribe';

// const defaultState = { data: {}, isReceiving: false };

export default function trafficData(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SUBS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SUBS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
