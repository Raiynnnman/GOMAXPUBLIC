import { RECEIVED_CHATO_DATA_SUCCESS, RECEIVING_CHATO_DATA } from '../actions/chatOffice';

// const defaultState = { data: {}, isReceiving: false };

export default function chatOffice(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CHATO_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CHATO_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
