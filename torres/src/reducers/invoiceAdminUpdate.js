import { RECEIVED_AIUP_DATA_SUCCESS, RECEIVING_AIUP_DATA } from '../actions/invoiceAdminUpdate';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function invoiceAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_AIUP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_AIUP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
