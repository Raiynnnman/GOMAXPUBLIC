import { RECEIVED_CONSU_DATA_SUCCESS, RECEIVING_CONSU_DATA } from '../actions/consultantAdminUpdate';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function consultantAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONSU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONSU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
