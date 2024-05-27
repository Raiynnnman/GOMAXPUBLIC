import { RECEIVED_INTENT_DATA_SUCCESS, RECEIVING_INTENT_DATA } from '../actions/setupIntent';

//const defaultState = { data: {}, isReceiving: false };

export default function setupIntent(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_INTENT_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_INTENT_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
