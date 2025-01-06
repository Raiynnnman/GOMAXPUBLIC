import { RECEIVED_OFPP_DATA_SUCCESS, RECEIVING_OFPP_DATA } from '../actions/profileSave';

//const defaultState = { data: {}, isReceiving: false };

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFPP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFPP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
