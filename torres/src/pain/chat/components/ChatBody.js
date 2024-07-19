import React from 'react';
import './chat.css';

const ChatBody = ({ messages, socket }) => {
  const handleLeaveChat = () => {
    window.location.href = 'http://localhost:3001/app/main/dashboard';
    window.location.reload();
  };

  return (
    <>
      <header className="chat__mainHeader">
        <p>Hangout with Colleagues</p>
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      <div className="message__container">
        {messages.map((message) => (
          <div className="message__chats" key={message.id}>
            <div className={message.socketID === socket.id ? "message__sender" : "message__recipient"}>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {/* <div className="message__status">
          <p>Someone is typing...</p>
        </div> */}
      </div>
    </>
  );
};

export default ChatBody;
