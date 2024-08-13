import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const CREATE_TICKET_REQUEST = 'CREATE_TICKET_REQUEST';
export const CREATE_TICKET_SUCCESS = 'CREATE_TICKET_SUCCESS';
export const CREATE_TICKET_FAILURE = 'CREATE_TICKET_FAILURE';
export const UPDATE_TICKET_REQUEST = 'UPDATE_TICKET_REQUEST';
export const UPDATE_TICKET_SUCCESS = 'UPDATE_TICKET_SUCCESS';
export const UPDATE_TICKET_FAILURE = 'UPDATE_TICKET_FAILURE';
export const FETCH_TICKETS_REQUEST = 'FETCH_TICKETS_REQUEST';
export const FETCH_TICKETS_SUCCESS = 'FETCH_TICKETS_SUCCESS';
export const FETCH_TICKETS_FAILURE = 'FETCH_TICKETS_FAILURE';

export const createTicketAction = (ticketData, callback) => {
    return async (dispatch) => {
        dispatch({ type: CREATE_TICKET_REQUEST });
        try {
            const response = await axios.post('/admin/tickets/create', ticketData);
            dispatch({ type: CREATE_TICKET_SUCCESS, payload: response.data });
            if (callback) {
                callback(null, response.data);
            }
        } catch (error) {
            dispatch({ type: CREATE_TICKET_FAILURE, payload: error });
            if (callback) {
                callback(error);
            }
        }
    };
};

export const updateTicketAction = (ticketId, updatedData, callback) => {
    return async (dispatch) => {
        dispatch({ type: UPDATE_TICKET_REQUEST });

        try {
            const response = await axios.post('/admin/tickets/update', { id: ticketId, ...updatedData });
            dispatch({ type: UPDATE_TICKET_SUCCESS, payload: response.data });
            if (callback) {
                callback(null, response.data);
            }
        } catch (error) {
            dispatch({ type: UPDATE_TICKET_FAILURE, payload: error });
            if (callback) {
                callback(error);
            }
        }
    };
};

export const fetchTicketsAction = (params = {}, callback) => {
    return async (dispatch) => {
        dispatch({ type: FETCH_TICKETS_REQUEST });
        try {
            const response = await axios.post('/admin/tickets/list', params);
            dispatch({ type: FETCH_TICKETS_SUCCESS, payload: response.data });
            if (callback) {
                callback(null, response.data);
            }
        } catch (error) {
            dispatch({ type: FETCH_TICKETS_FAILURE, payload: error });
            if (callback) {
                callback(error);
            }
        }
    };
};
