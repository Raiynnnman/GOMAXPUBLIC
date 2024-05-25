import { RECEIVED_INVA_DATA_SUCCESS, RECEIVING_INVA_DATA } from '../actions/invoiceAdmin';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function invoiceAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_INVA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_INVA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
