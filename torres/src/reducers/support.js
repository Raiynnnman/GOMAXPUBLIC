import { RECEIVED_SUPPL_DATA_SUCCESS, RECEIVING_SUPPL_DATA } from '../actions/support';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SUPPL_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SUPPL_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
