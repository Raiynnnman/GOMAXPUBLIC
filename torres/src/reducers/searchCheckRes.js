import { RECEIVED_SCR_DATA_SUCCESS, RECEIVING_SCR_DATA } from '../actions/searchCheckRes';

// const defaultState = { data: {}, isReceiving: false };

export default function searchCheckRes(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SCR_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SCR_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
