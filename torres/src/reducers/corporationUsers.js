import { RECEIVED_CORPU_DATA_SUCCESS, RECEIVING_CORPU_DATA } from '../actions/corporationUsers';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeUsers(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CORPU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CORPU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
