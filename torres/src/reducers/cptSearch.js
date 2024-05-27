import { RECEIVED_CPTS_DATA_SUCCESS, RECEIVING_CPTS_DATA } from '../actions/cptSearch';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:[]},{type,payload}) {
    switch (type) {
        case RECEIVED_CPTS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CPTS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
