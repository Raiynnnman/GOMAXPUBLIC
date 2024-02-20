import { RECEIVED_BUNDS_DATA_SUCCESS, RECEIVING_BUNDS_DATA } from '../actions/bundleSave';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function bundleSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_BUNDS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_BUNDS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
