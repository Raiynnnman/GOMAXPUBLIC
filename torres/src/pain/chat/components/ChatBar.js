import React from 'react';
import './chat.css';
import { Typography } from '@mui/material';

const ChatBar = ({ users }) => {
  return (
    <div className="chat__sidebar">
      <Typography>Chat Rooms</Typography>
      <div>
        {users.map((user) => (
          <div key={user.socketID} className="chat__user">
            {user.socketID}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatBar;
