import { RECEIVED_CAPPT_DATA_SUCCESS, RECEIVING_CAPPT_DATA } from "../actions/mydayCustomAppt";

//const defaultState = { data: {}, isReceiving: false };

export default function mydayGetOfficePatients(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CAPPT_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CAPPT_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
