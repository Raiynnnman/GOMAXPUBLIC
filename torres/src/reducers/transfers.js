import { RECEIVED_UTRAN_DATA_SUCCESS, RECEIVING_UTRAN_DATA } from '../actions/transfers';

// const defaultState = { data: {}, isReceiving: false };

export default function transfers(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_UTRAN_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_UTRAN_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
