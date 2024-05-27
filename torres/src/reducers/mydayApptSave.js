import { RECEIVED_MYDSA_DATA_SUCCESS, RECEIVING_MYDSA_DATA } from '../actions/mydayApptSave';

//const defaultState = { data: {}, isReceiving: false };

export default function mydayApptSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_MYDSA_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_MYDSA_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
