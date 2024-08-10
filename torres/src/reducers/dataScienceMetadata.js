import { RECEIVED_DMD_DATA_SUCCESS, RECEIVING_DMD_DATA } from '../actions/dataScienceMetadata';

//const defaultState = { data: {}, isReceiving: false };

export default function invoiceAdmin(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DMD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DMD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
