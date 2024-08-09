import { RECEIVED_DSQU_DATA_SUCCESS, RECEIVING_DSQU_DATA } from '../actions/dataScienceQueriesUpdate';

//const defaultState = { data: {}, isReceiving: false };

export default function invoiceAdminUpdate(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_DSQU_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_DSQU_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
