import { RECEIVED_OFFREP1_DATA_SUCCESS, RECEIVING_OFFREP1_DATA } from '../actions/officeReportDownload';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function officeSave(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_OFFREP1_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_OFFREP1_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
