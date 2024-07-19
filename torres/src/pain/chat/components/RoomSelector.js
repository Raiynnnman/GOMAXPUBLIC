import React, { useState } from 'react';
const RoomSelector = ({ onRoomChange }) => {
  const [roomName, setRoomName] = useState('');

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      onRoomChange(roomName);
      setRoomName('');
    }
  };

  return (
    <div className="room-selector">
      <form onSubmit={handleJoinRoom}>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
};

export default RoomSelector;
