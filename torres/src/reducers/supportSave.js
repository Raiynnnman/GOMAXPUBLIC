import { RECEIVED_SUPPS_DATA_SUCCESS, RECEIVING_SUPPS_DATA } from '../actions/supportSave';

//const defaultState = { data: {}, isReceiving: false };

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_SUPPS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_SUPPS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
