import { RECEIVED_LEADS_DATA_SUCCESS, RECEIVING_LEADS_DATA } from '../actions/leadsSave';

//const defaultState = { data: {}, isReceiving: false };

export default function leadsSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_LEADS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_LEADS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
