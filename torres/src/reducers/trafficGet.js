import { RECEIVED_TRAFF_DATA_SUCCESS, RECEIVING_TRAFF_DATA } from '../actions/trafficGet';

// const defaultState = { data: {}, isReceiving: false };

export default function trafficData(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_TRAFF_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_TRAFF_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
