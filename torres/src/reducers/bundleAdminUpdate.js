import { RECEIVED_BUNDU_DATA_SUCCESS, RECEIVING_BUNDU_DATA } from '../actions/bundleAdminUpdate';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function bundleAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_BUNDU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_BUNDU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
