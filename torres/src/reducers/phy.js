import { RECEIVED_PHY_DATA_SUCCESS, RECEIVING_PHY_DATA } from '../actions/phy';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function phy(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_PHY_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_PHY_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
