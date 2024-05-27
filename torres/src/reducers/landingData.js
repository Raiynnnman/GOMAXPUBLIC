import { RECEIVED_LAND_DATA_SUCCESS, RECEIVING_LAND_DATA } from '../actions/landingData';

//const defaultState = { data: {}, isReceiving: false };

export default function landingData(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_LAND_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_LAND_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
