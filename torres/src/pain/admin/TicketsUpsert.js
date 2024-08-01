import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Card, CardContent, Typography, Box, Avatar, Grid, IconButton, TextField, Button, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TicketsUpsert = ({ open, onClose, ticket, comments, onSubmitComment }) => {
  const [newComment, setNewComment] = useState('');
  
  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim() !== '') {
      onSubmitComment(newComment);
      setNewComment('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Office Name: {ticket.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.orange[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ margin: 2, padding: 2 }}>
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
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
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Comments
            </Typography>
            {comments.map((comment, index) => (
              <Paper key={index} sx={{ marginTop: 1, padding: 1, borderRadius: 2, backgroundColor: '#f1f0f0', display: 'flex', alignItems: 'flex-start' }}>
                <Avatar sx={{ marginRight: 1 }}>{comment.first_name.charAt(0)}{comment.last_name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle2" component="div">
                    {comment.first_name} {comment.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(comment.created).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
                    {comment.text}
                  </Typography>
                </Box>
              </Paper>
            ))}
            <Box sx={{ marginTop: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Enter your comment"
                value={newComment}
                onChange={handleCommentChange}
                multiline
                rows={4}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
                onClick={handleCommentSubmit}
              >
                Submit Comment
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TicketsUpsert;
