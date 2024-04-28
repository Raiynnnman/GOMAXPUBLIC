import { RECEIVED_OFFLOC_DATA_SUCCESS, RECEIVING_OFFLOC_DATA } from '../actions/officeLocations';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeInvoices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFFLOC_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFFLOC_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
