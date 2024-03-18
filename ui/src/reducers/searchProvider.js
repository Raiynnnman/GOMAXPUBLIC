import { RECEIVED_SRP_DATA_SUCCESS, RECEIVING_SRP_DATA } from '../actions/searchProvider';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function searchRegister(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SRP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SRP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
