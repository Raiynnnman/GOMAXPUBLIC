import { RECEIVED_REGUP_DATA_SUCCESS, RECEIVING_REGUP_DATA } from '../actions/registrationAdminUpdate';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function registrationAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REGUP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REGUP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
