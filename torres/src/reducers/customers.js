import { RECEIVED_CLI_DATA_SUCCESS, RECEIVING_CLI_DATA } from '../actions/customers';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function getCustomers(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CLI_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CLI_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
