import { RECEIVED_DCONT_DATA_SUCCESS, RECEIVING_DCONT_DATA } from '../actions/delContext';

//const defaultState = { data: {}, isReceiving: false };

export default function delContext(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DCONT_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DCONT_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
