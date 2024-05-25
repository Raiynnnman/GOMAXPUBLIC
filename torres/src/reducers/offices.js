import { RECEIVED_OFF_DATA_SUCCESS, RECEIVING_OFF_DATA } from '../actions/offices';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFF_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFF_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
