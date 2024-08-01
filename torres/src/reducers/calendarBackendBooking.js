import { RECEIVED_CALBACKB_DATA_SUCCESS, RECEIVING_CALBACKB_DATA } from '../actions/calendarBackendBooking';

//const defaultState = { data: {}, isReceiving: false };

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CALBACKB_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CALBACKB_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
