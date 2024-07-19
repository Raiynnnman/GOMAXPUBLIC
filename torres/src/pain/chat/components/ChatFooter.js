import React, { useState } from 'react';
import './chat.css';

const ChatFooter = ({ socket, roomName }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("handleSendMessage called");
    if (message.trim() && roomName) {
      console.log("Sending message:", message);
      socket.emit('message', {
        roomName,
        message,
      });
      setMessage('');
    } else {
      console.log("Message is empty or room not selected");
    }
  };

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="sendBtn" type="submit">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
