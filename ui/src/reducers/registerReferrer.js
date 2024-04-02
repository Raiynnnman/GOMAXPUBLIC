import { RECEIVED_REGR_DATA_SUCCESS, RECEIVING_REGR_DATA } from '../actions/registerReferrer';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REGR_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REGR_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
