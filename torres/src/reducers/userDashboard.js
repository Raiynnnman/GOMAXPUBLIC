import { RECEIVED_UDASH_DATA_SUCCESS, RECEIVING_UDASH_DATA } from '../actions/userDashboard';

// const defaultState = { data: {}, isReceiving: false };

export default function userDashboard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_UDASH_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_UDASH_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
