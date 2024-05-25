import { RECEIVED_MYDSS_DATA_SUCCESS, RECEIVING_MYDSS_DATA } from '../actions/mydaySchedSave';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function mydaySchedSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_MYDSS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_MYDSS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
