import { RECEIVED_CONBILL_DATA_SUCCESS, RECEIVING_CONBILL_DATA } from '../actions/consultantBilling';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function consultantBilling(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONBILL_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONBILL_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
