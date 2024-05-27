import { RECEIVED_MORS_DATA_SUCCESS, RECEIVING_MORS_DATA } from '../actions/moreSchedules';

//const defaultState = { data: {}, isReceiving: false };

export default function moreSchedules(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_MORS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_MORS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
