import { RECEIVED_USERCD_DATA_SUCCESS, RECEIVING_USERCD_DATA } from '../actions/userDefaultCard';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function userDefaultCard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_USERCD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_USERCD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
