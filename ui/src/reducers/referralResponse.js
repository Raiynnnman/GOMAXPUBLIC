import { RECEIVED_REFREP_DATA_SUCCESS, RECEIVING_REFREP_DATA } from '../actions/referralResponse';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REFREP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REFREP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
