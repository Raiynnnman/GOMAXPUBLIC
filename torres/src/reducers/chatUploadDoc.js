import { RECEIVED_CHUD_DATA_SUCCESS, RECEIVING_CHUD_DATA } from '../actions/chatUploadDoc';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function chatUploadDoc(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CHUD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CHUD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
