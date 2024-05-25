import { RECEIVED_CONS_DATA_SUCCESS, RECEIVING_CONS_DATA } from '../actions/legal';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function legals(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
