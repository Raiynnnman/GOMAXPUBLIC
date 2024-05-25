import { RECEIVED_OFFIN_DATA_SUCCESS, RECEIVING_OFFIN_DATA } from '../actions/officeInvoices';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeInvoices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFFIN_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFFIN_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
