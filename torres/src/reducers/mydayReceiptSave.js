import { RECEIVED_MRECE_DATA_SUCCESS, RECEIVING_MRECE_DATA } from '../actions/mydayReceiptSave';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function mydayReceiptSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_MRECE_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_MRECE_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
