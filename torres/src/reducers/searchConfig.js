import { RECEIVED_SECONF_DATA_SUCCESS, RECEIVING_SECONF_DATA } from '../actions/searchConfig';

// const defaultState = { data: {}, isReceiving: false };

export default function searchConfig(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SECONF_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SECONF_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
