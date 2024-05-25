import { RECEIVED_OFFU_DATA_SUCCESS, RECEIVING_OFFU_DATA } from '../actions/officeUsers';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeUsers(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFFU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFFU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
