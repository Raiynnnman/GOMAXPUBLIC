import { RECEIVED_SRA_DATA_SUCCESS, RECEIVING_SRA_DATA } from '../actions/searchRegisterAdmin';

// const defaultState = { data: {}, isReceiving: false };

export default function searchRegisterAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SRA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SRA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
