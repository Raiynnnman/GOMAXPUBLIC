import { RECEIVED_OCU_DATA_SUCCESS, RECEIVING_OCU_DATA } from '../actions/officeClientUpdate';

//const defaultState = { data: {}, isReceiving: false };

export default function searchRegisterAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OCU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OCU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
