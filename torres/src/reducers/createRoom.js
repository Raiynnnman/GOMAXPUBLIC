import { RECEIVED_CROOM_DATA_SUCCESS, RECEIVING_CROOM_DATA } from '../actions/createRoom';

//const defaultState = { data: {}, isReceiving: false };

export default function createRoom(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CROOM_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CROOM_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
