import { RECEIVED_LOCS_DATA_SUCCESS, RECEIVING_LOCS_DATA } from '../actions/location';

//const defaultState = { data: {}, isReceiving: false };

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_LOCS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_LOCS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
