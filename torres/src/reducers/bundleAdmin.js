import { RECEIVED_BUNDA_DATA_SUCCESS, RECEIVING_BUNDA_DATA } from '../actions/bundleAdmin';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function bundleAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_BUNDA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_BUNDA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
