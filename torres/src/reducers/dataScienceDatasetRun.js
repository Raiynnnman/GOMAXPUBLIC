import { RECEIVED_DSR_DATA_SUCCESS, RECEIVING_DSR_DATA } from '../actions/dataScienceDatasetRun';

//const defaultState = { data: {}, isReceiving: false };

export default function invoiceAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DSR_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DSR_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
