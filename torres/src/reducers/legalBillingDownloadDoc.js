import { RECEIVED_CBDD_DATA_SUCCESS, RECEIVING_CBDD_DATA } from '../actions/legalBillingDownloadDoc';

//const defaultState = { data: {}, isReceiving: false };

export default function legalBillingDownloadDoc(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CBDD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CBDD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
