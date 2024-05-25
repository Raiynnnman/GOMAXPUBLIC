import { RECEIVED_MYDINV_DATA_SUCCESS, RECEIVING_MYDINV_DATA } from '../actions/mydayApproveInvoice';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function approveinvoice(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_MYDINV_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_MYDINV_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
