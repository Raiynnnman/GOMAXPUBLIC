import { RECEIVED_ODEMO_DATA_SUCCESS, RECEIVING_ODEMO_DATA } from '../actions/onlineDemo';

//const defaultState = { data: {}, isReceiving: false };

export default function offices(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_ODEMO_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_ODEMO_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
