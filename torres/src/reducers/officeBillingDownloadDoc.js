import { RECEIVED_OFDD_DATA_SUCCESS, RECEIVING_OFDD_DATA } from '../actions/officeBillingDownloadDoc';

//const defaultState = { data: {}, isReceiving: false };

export default function officeBillingDownloadDoc(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFDD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFDD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
