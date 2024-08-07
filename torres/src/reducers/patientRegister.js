import { RECEIVED_PATREG_DATA_SUCCESS, RECEIVING_PATREG_DATA } from '../actions/patientRegister';

// const defaultState = { data: {}, isReceiving: false };

export default function trafficData(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PATREG_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PATREG_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
