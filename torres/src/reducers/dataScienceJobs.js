import { RECEIVED_DSJOB_DATA_SUCCESS, RECEIVING_DSJOB_DATA } from '../actions/dataScienceJobs';

//const defaultState = { data: {}, isReceiving: false };

export default function invoiceAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DSJOB_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DSJOB_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
