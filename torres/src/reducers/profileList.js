import { RECEIVED_OFLIST_DATA_SUCCESS, RECEIVING_OFLIST_DATA } from '../actions/profileList';

//const defaultState = { data: {}, isReceiving: false };

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFLIST_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFLIST_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
