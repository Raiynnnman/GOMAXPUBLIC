import { RECEIVED_USERA_DATA_SUCCESS, RECEIVING_USERA_DATA } from '../actions/userAdmin';

// const defaultState = { data: {}, isReceiving: false };

export default function userAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_USERA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_USERA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
