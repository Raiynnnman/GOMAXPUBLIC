import { RECEIVED_DSL_DATA_SUCCESS, RECEIVING_DSL_DATA } from '../actions/dataScienceDataset';

//const defaultState = { data: {}, isReceiving: false };

export default function invoiceAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DSL_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DSL_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
