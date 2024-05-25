import { RECEIVED_CHFDD_DATA_SUCCESS, RECEIVING_CHFDD_DATA } from '../actions/chatDownloadDoc';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function chatDownloadDoc(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CHFDD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CHFDD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
