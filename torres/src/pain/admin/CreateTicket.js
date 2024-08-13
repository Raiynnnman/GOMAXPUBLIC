import React, { useState } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { createTicketAction } from '../../actions/ticketsUpsert';
import { useDispatch, useSelector } from 'react-redux';

const CreateTicketModal = ({ opened, color,variant}) => {
  const [open, setOpen] = useState(opened);
  const [ticket, setTicket] = useState({
    ticketName: '',
    description: '',
    urgency: '',
    status: ''
  });
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const handleChange = (event) => {
    setTicket({
      ...ticket,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const ticketInformation = {
        ...ticket,
        user: {
            permissions: currentUser.permissions,
            email: currentUser.email,
            firstName: currentUser.first_name,
            lastName: currentUser.last_name,
            id: currentUser.id,
            role: currentUser.entitlements,
            office_id: currentUser.offices[0]
        }
    };
    // console.log("Blended ticket info: ", ticketInformation);    
    // console.log(currentUser)
    dispatch(createTicketAction(ticketInformation));
    // console.log(ticket);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button  color={color} variant={variant} onClick={() => setOpen(true)}>
        Create Ticket
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create Ticket</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField 
              margin="dense"
              name="ticketName" 
              label="Ticket Name" 
              fullWidth 
              value={ticket.ticketName} 
              onChange={handleChange} 
            />
            <TextField 
              margin="dense"
              name="description" 
              label="Description" 
              fullWidth 
              multiline 
              rows={4} 
              value={ticket.description} 
              onChange={handleChange} 
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Urgency</InputLabel>
              <Select 
                name="urgency" 
                value={ticket.urgency} 
                onChange={handleChange}
              >
                <MenuItem value={1}>Low</MenuItem>
                <MenuItem value={2}>Medium</MenuItem>
                <MenuItem value={3}>High</MenuItem>
                <MenuItem value={4}>Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select 
                name="status" 
                value={ticket.status} 
                onChange={handleChange}
              >
                <MenuItem value={1}>Open</MenuItem>
                <MenuItem value={2}>In Progress</MenuItem>
                <MenuItem value={3}>Review</MenuItem>
                <MenuItem value={4}>Closed</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateTicketModal;