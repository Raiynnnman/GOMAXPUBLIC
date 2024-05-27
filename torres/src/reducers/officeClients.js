import { RECEIVED_OCL_DATA_SUCCESS, RECEIVING_OCL_DATA } from '../actions/officeClients';

//const defaultState = { data: {}, isReceiving: false };

export default function searchRegisterAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OCL_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OCL_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
