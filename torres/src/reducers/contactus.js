import { RECEIVED_CONTUS_DATA_SUCCESS, RECEIVING_CONTUS_DATA } from '../actions/contactus';

// const defaultState = { data: {}, isReceiving: false };

export default function trafficData(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CONTUS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CONTUS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
