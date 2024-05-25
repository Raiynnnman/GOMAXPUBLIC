import { RECEIVED_COMD_DATA_SUCCESS, RECEIVING_COMD_DATA } from '../actions/registrationReport';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_COMD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_COMD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
