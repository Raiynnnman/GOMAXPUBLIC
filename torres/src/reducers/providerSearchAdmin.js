import { RECEIVED_PROCAS_DATA_SUCCESS, RECEIVING_PROCAS_DATA } from '../actions/providerSearchAdmin';

//const defaultState = { data: {}, isReceiving: false };

export default function proceduresSearch(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PROCAS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PROCAS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
