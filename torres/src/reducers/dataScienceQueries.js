import { RECEIVED_DSQ_DATA_SUCCESS, RECEIVING_DSQ_DATA } from '../actions/dataScienceQueries';

//const defaultState = { data: {}, isReceiving: false };

export default function invoiceAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DSQ_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DSQ_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
