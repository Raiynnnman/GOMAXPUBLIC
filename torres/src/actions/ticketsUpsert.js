export const updateTicketAction = (ticketId, updatedData) => {
    return (dispatch) => {
        dispatch({ type: 'UPDATE_TICKET_REQUEST' });

        fetch(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'UPDATE_TICKET_SUCCESS', payload: data });
            })
            .catch(error => {
                console.error('Error updating ticket:', error);
                dispatch({ type: 'UPDATE_TICKET_FAILURE', payload: error });
            });
    };
};

export const deleteTicketAction = (ticketId) => {
    return (dispatch) => {
        dispatch({ type: 'DELETE_TICKET_REQUEST' });

        fetch(`/api/tickets/${ticketId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'DELETE_TICKET_SUCCESS', payload: data });
            })
            .catch(error => {
                console.error('Error deleting ticket:', error);
                dispatch({ type: 'DELETE_TICKET_FAILURE', payload: error });
            });
    };
};

export const createTicketAction = (ticketData) => {
    return (dispatch) => {
        dispatch({ type: 'CREATE_TICKET_REQUEST' });

        fetch('/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'CREATE_TICKET_SUCCESS', payload: data });
            })
            .catch(error => {
                console.error('Error creating ticket:', error);
                dispatch({ type: 'CREATE_TICKET_FAILURE', payload: error });
            });
    };
};