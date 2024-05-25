import { RECEIVED_PROC_DATA_SUCCESS, RECEIVING_PROC_DATA } from '../actions/procedures';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function procedures(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PROC_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PROC_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
