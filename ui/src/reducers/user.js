import { RECEIVED_USER_DATA_SUCCESS, RECEIVING_USER_DATA } from '../actions/user';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function user(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_USER_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_USER_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
