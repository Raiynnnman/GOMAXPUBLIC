import { RECEIVED_REFUP_DATA_SUCCESS, RECEIVING_REFUP_DATA } from '../actions/referralAdminUpdate';

//const defaultState = { data: {}, isReceiving: false };

export default function registrationAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REFUP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REFUP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
