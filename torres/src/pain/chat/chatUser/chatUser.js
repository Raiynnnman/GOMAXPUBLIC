import React, { Component } from 'react';
import socketIO from 'socket.io-client';
import ChatBar from '../components/ChatBar';
import ChatFooter from '../components/ChatFooter';
import ChatBody from '../components/ChatBody';
import RoomSelector from '../components/RoomSelector';
import '../components/chat.css';
import Navbar from '../../../components/Navbar';
import { connect } from 'react-redux';

const socket = socketIO('http://localhost:8000');

class ChatUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      users: [],
      currentRoom: '',
      currentUserId:''
    };
  }

  componentDidMount() {
    console.log("lookkk here",this.props)
    socket.on('messageResponse', this.handleMessageResponse);
    socket.on('roomMessages', this.handleRoomMessages);
  }

  componentWillUnmount() {
    socket.off('messageResponse', this.handleMessageResponse);
    socket.off('roomMessages', this.handleRoomMessages);
  }

  handleMessageResponse = (data) => {
    this.setState((prevState) => ({
      messages: [...prevState.messages, data],
      currentUserId: this.props.currentUser.id
    }));
    console.log(this.state.currentUserId)
  };

  handleRoomMessages = (messages) => {
    this.setState({ messages });
  };

  handleRoomChange = (roomName) => {
    this.setState({ currentRoom: roomName, messages: [] });
    socket.emit('joinRoom', { roomName });
  };

  render() {
    return (
        <>
     <Navbar/>
      <div className="chat">
         <ChatBar users={this.state.users} />
        <div className="chat__main">
          <ChatBody messages={this.state.messages} socket={socket} />
          <ChatFooter socket={socket} roomName={this.state.currentRoom} />
        </div>
      </div>
        </>
    );
  }
}
function mapStateToProps(state) {
    return {
      currentUser: state.auth.currentUser,
      userDashboard: state.userDashboard
    }
  }
  
  export default connect(mapStateToProps)(ChatUser)
