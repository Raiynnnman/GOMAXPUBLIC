import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const TicketsUpsert = ({ ticket }) => {
  console.log("here",ticket);
  return (
    <Card sx={{ margin: 2, padding: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {ticket.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {ticket.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {ticket.status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Urgency: {ticket.urgency}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(ticket.created).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Updated: {new Date(ticket.updated).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TicketsUpsert;
