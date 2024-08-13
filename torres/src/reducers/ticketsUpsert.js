import { 
    FETCH_TICKETS_SUCCESS, 
    CREATE_TICKET_REQUEST, 
    CREATE_TICKET_SUCCESS, 
    CREATE_TICKET_FAILURE, 
    UPDATE_TICKET_REQUEST, 
    UPDATE_TICKET_SUCCESS, 
    UPDATE_TICKET_FAILURE, 
    FETCH_TICKETS_FAILURE 
} from "../actions/ticketsUpsert";

const initialState = {
    list: [],
    loading: false,
    error: null,
};

const ticketsReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case CREATE_TICKET_REQUEST:
        case UPDATE_TICKET_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_TICKETS_SUCCESS:
            return {
                ...state,
                loading: false,
                list: payload.data,
            };
        case CREATE_TICKET_SUCCESS:
            console.log('Payload on CREATE_TICKET_SUCCESS:', payload);
            return {
                ...state,
                loading: false,
                list: [state.list, payload],  
            };
        case UPDATE_TICKET_SUCCESS:
            return {
                ...state,
                loading: false,
                list: state.list.map(ticket =>
                    ticket.id === payload.id ? payload : ticket
                ),
            };
        case FETCH_TICKETS_FAILURE:
        case CREATE_TICKET_FAILURE:
        case UPDATE_TICKET_FAILURE:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        default:
            return state;
    }
};

export default ticketsReducer;
