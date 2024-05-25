import { RECEIVED_CARD_DATA_SUCCESS, RECEIVING_CARD_DATA } from '../actions/saveCard';

const defaultState = {
    data: {},
    isReceiving: false
};

export default function saveCard(state = {data:{}},{type,payload}) {
    switch (type) {
        case RECEIVED_CARD_DATA_SUCCESS:
            return Object.assign({}, state, {
                data:payload,
                isReceiving: false
            });
        case RECEIVING_CARD_DATA:
            return Object.assign({}, state, {
                isReceiving: true
            });
        default:
            return state;
    }
}
