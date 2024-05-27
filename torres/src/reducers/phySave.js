import { RECEIVED_PHYS_DATA_SUCCESS, RECEIVING_PHYS_DATA } from '../actions/phySave';

//const defaultState = { data: {}, isReceiving: false };

export default function phySave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PHYS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PHYS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
