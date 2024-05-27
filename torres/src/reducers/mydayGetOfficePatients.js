import { RECEIVED_GOP_DATA_SUCCESS, RECEIVING_GOP_DATA } from '../actions/mydayGetOfficePatients';

//const defaultState = { data: {}, isReceiving: false };

export default function mydayGetOfficePatients(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_GOP_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_GOP_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
