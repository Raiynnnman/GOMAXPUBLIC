import { RECEIVED_OFAU_DATA_SUCCESS, RECEIVING_OFAU_DATA } from '../actions/officeAssociationUpdate';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFAU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFAU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
