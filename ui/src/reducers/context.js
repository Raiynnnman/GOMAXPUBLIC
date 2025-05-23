import { RECEIVED_CONT_DATA_SUCCESS, RECEIVING_CONT_DATA } from '../actions/context';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function context(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONT_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONT_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
