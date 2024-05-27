import { RECEIVED_LEAD_DATA_SUCCESS, RECEIVING_LEAD_DATA } from '../actions/leads';

//const defaultState = { data: {}, isReceiving: false };

export default function leads(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_LEAD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_LEAD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
