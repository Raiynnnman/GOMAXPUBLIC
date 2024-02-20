import { RECEIVED_UUD_DATA_SUCCESS, RECEIVING_UUD_DATA } from '../actions/userDocumentsUpdate';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function userDocumentsUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_UUD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_UUD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
