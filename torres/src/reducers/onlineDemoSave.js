import { RECEIVED_ONDES_DATA_SUCCESS, RECEIVING_ONDES_DATA } from '../actions/onlineDemoSave';

//const defaultState = { data: {}, isReceiving: false };

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_ONDES_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_ONDES_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
