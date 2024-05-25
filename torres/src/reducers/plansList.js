import { RECEIVED_PLANS_DATA_SUCCESS, RECEIVING_PLANS_DATA } from '../actions/plansList';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function plansList(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PLANS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PLANS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
