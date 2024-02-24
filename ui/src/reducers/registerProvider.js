import { RECEIVED_REGPROV_DATA_SUCCESS, RECEIVING_REGPROV_DATA } from '../actions/registerProvider';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function invoiceAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REGPROV_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REGPROV_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
