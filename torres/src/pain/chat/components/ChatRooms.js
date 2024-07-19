import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatRooms = ({ onRoomSelect }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLabel, setNewRoomLabel] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await axios.get('http://localhost:5000/chat/rooms');
      setRooms(response.data.rooms);
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    const response = await axios.post('http://localhost:5000/chat/room', {
      name: newRoomName,
      label: newRoomLabel,
    });
    setRooms([...rooms, response.data]);
    setNewRoomName('');
    setNewRoomLabel('');
  };

  return (
    <div>
      <h2>Chat Rooms</h2>
      <ul>
        {rooms.map(room => (
          <li key={room.id} onClick={() => onRoomSelect(room.id)}>{room.label}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Room Name"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room Label"
        value={newRoomLabel}
        onChange={(e) => setNewRoomLabel(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
};

export default ChatRooms;
