import { RECEIVED_CONSA_DATA_SUCCESS, RECEIVING_CONSA_DATA } from '../actions/legalAdmin';

//const defaultState = { data: {}, isReceiving: false };

export default function legalAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONSA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONSA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
