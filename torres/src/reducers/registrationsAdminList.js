import { RECEIVED_REGL_DATA_SUCCESS, RECEIVING_REGL_DATA } from '../actions/registrationsAdminList';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_REGL_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_REGL_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
