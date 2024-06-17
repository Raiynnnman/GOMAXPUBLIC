import { RECEIVED_CUST_DATA_SUCCESS, RECEIVING_CUST_DATA } from '../actions/appointments';

//const defaultState = { data: {}, isReceiving: false };

export default function getAppointments(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CUST_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CUST_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
