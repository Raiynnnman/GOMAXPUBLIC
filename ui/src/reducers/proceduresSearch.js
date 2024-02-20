import { RECEIVED_PROCS_DATA_SUCCESS, RECEIVING_PROCS_DATA } from '../actions/proceduresSearch';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function proceduresSearch(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PROCS_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PROCS_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
