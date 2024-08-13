import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Typography, Chip, Avatar, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import Textarea from '@mui/joy/Textarea';
import { IconButton, Stack } from '@mui/joy';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { updateTicketAction } from '../../actions/ticketsUpsert';

const TicketsUpsert = ({ open, onClose, ticket, comments }) => {
  const [newComment, setNewComment] = useState('');
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();

  const handleCommentSubmit = () => {
    if (newComment.trim() !== '') {
      const updatedData = {
        comments: [...comments, { text: newComment, user_id: currentUser.id, office_id: currentUser.offices[0] }],
      };
      dispatch(updateTicketAction(ticket.id, updatedData, (error, data) => {
        if (!error) {
          setNewComment('');
        }
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Closed':
        return 'success';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleClick = () => {
    if (newComment.trim() !== '') {
      handleCommentSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontSize='30px' variant='Header'>
        {ticket.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#fb8c00',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Status: ${ticket.status}`} color={getStatusColor(ticket.status)} />
          <Chip label={`Urgency: ${ticket.urgency_level}`} color={getUrgencyColor(ticket.urgency_level)} />
          <Chip label={`Created: ${new Date(ticket.created).toLocaleString().split(':')}`} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          Description:
          <Paper sx={{
            marginTop: 2,
            boxShadow: 3,
            padding: 1,
            borderRadius: 2,
            maxWidth: '60%',
            maxHeight: '50%', 
          }}>
            {ticket.description}
          </Paper>
        </Box>
        <Box sx={{ margin: 2, padding: 2, borderRadius: 1 }}>
          <Typography>
            Comments
          </Typography>
          <Box sx={{ marginTop: 2, backgroundColor: '#FEFDFD', padding: 2, borderRadius: 2 }}>
            {comments.map((comment, index) => {
              const isCurrentUser = comment.user_id === currentUser.id;
              return (
                <Box key={index} sx={{ marginBottom: 2, display: 'flex', flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                  <Paper
                    sx={{
                      marginTop: 1,
                      boxShadow: 5,
                      padding: 1,
                      borderRadius: 2,
                      backgroundColor: isCurrentUser ? '#FFAB69' : '#ffffff',
                      maxWidth: '60%',
                      wordBreak: 'break-word',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ marginRight: 1, backgroundColor: isCurrentUser ? '#ff9800' : '#9e9e9e', color: '#fff' }}>
                        {comment.first_name.charAt(0)}{comment.last_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {comment.text}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                  <Typography variant="subtitle4" component="div" sx={{ textAlign: isCurrentUser ? 'right' : 'left' }}>
                    {comment.first_name} {comment.last_name}
                    <Typography variant="body2" color="text.secondary">
                      {new Date(comment.created).toLocaleString()}
                    </Typography>
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ marginTop: 3 }}>
          <FormControl>
            <Textarea
              placeholder="Type something here…"
              aria-label="Message"
              onChange={(e) => {
                setNewComment(e.target.value);
              }}
              value={newComment}
              minRows={3}
              maxRows={10}
              endDecorator={
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexGrow: 1,
                    py: 1,
                    pr: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <div>
                    <IconButton size="sm" variant="plain" color="neutral">
                      <FormatBoldRoundedIcon />
                    </IconButton>
                    <IconButton size="sm" variant="plain" color="neutral">
                      <FormatItalicRoundedIcon />
                    </IconButton>
                    <IconButton size="sm" variant="plain" color="neutral">
                      <StrikethroughSRoundedIcon />
                    </IconButton>
                    <IconButton size="sm" variant="plain" color="neutral">
                      <FormatListBulletedRoundedIcon />
                    </IconButton>
                  </div>
                  <Button
                    size="sm"
                    color="warning-400"
                    sx={{ alignSelf: 'center', borderRadius: 'sm' }}
                    endDecorator={<SendRoundedIcon />}
                    onClick={handleClick}
                  >
                    Send
                  </Button>
                </Stack>
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  handleClick();
                }
              }}
              sx={{
                '& textarea:first-of-type': {
                  minHeight: 72,
                },
              }}
            />
          </FormControl>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TicketsUpsert;
