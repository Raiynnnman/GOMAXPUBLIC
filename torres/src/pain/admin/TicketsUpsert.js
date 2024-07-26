import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Box, Button, Modal, Typography, TextField } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export class TicketsUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticket: this.props.ticket || {},
        };
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            ticket: {
                ...prevState.ticket,
                [name]: value,
            },
        }));
    };

    handleSave = () => {
        // Save logic here
        this.props.onClose();
    };

    render() {
        const { open, onClose } = this.props;
        const { ticket } = this.state;

        return (
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Edit Ticket
                    </Typography>
                    <TextField
                        label="Ticket Number"
                        name="ticketNumber"
                        value={ticket.ticketNumber || ''}
                        onChange={this.handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={ticket.description || ''}
                        onChange={this.handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Status"
                        name="status"
                        value={ticket.status || ''}
                        onChange={this.handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Assigned To"
                        name="assignedTo"
                        value={ticket.assignedTo || ''}
                        onChange={this.handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={onClose} variant="contained" color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSave} variant="contained" color="primary">
                            Save
                        </Button>
                    </Box>
                </Box>
            </Modal>
        );
    }
}

TicketsUpsert.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    ticket: PropTypes.object,
};

export default TicketsUpsert;
