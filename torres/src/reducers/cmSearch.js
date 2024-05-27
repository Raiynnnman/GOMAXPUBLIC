import { RECEIVED_CM_DATA_SUCCESS, RECEIVING_CM_DATA } from '../actions/cmSearch';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:[]},{type,payload}) {
    switch (type) {
        case RECEIVED_CM_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CM_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
