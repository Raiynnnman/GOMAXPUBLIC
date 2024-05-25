import { RECEIVED_REFDASH_DATA_SUCCESS, RECEIVING_REFDASH_DATA } from '../actions/referrerDashboard';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function legalDashboard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REFDASH_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REFDASH_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
