import { RECEIVED_CONDASH_DATA_SUCCESS, RECEIVING_CONDASH_DATA } from '../actions/legalDashboard';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function legalDashboard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONDASH_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONDASH_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
