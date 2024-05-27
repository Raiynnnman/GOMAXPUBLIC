import { RECEIVED_ACORP_DATA_SUCCESS, RECEIVING_ACORP_DATA } from '../actions/corporationAdmin';

//const defaultState = { data: {}, isReceiving: false };

export default function adminCorporation(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_ACORP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_ACORP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
