import { RECEIVED_PROVDASH_DATA_SUCCESS, RECEIVING_PROVDASH_DATA } from '../actions/providerDashboard';

//const defaultState = { data: {}, isReceiving: false };

export default function providerDashboard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PROVDASH_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PROVDASH_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
