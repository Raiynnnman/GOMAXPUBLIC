import { RECEIVED_OFFLOCS_DATA_SUCCESS, RECEIVING_OFFLOCS_DATA } from '../actions/officeLocationsSave';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeInvoices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFFLOCS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFFLOCS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
