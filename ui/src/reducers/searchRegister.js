import { RECEIVED_SR_DATA_SUCCESS, RECEIVING_SR_DATA } from '../actions/searchRegister';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function searchRegister(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SR_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SR_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
