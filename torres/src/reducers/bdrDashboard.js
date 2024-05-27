import { RECEIVED_BDASH_DATA_SUCCESS, RECEIVING_BDASH_DATA } from '../actions/bdrDashboard';

//const defaultState = { data: {}, isReceiving: false };

export default function adminDashboard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_BDASH_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_BDASH_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
