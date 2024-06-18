import { RECEIVED_CHATU_DATA_SUCCESS, RECEIVING_CHATU_DATA } from '../actions/chatUser';

const defaultState = { data: {}, isReceiving: false };

export default function chatUser(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CHATU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CHATU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
