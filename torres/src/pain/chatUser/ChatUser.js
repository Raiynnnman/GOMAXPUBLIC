import React, { Component } from 'react';
import ChatDialog from '../chatCommon/components/ChatDialog';
import ChatInfo from '../chatCommon/components/ChatInfo';
import ChatList from '../chatCommon/components/ChatList';
import { connect } from 'react-redux';
import { MobileChatStates } from '../../reducers/chat';
import s from './Chat.module.scss';
import { getChatUser } from '../../actions/chatUser';
import { push } from 'connected-react-router';
import { createRoom } from '../../actions/createRoom';
import AppSpinner from '../utils/Spinner';
import { setActiveChat } from '../../actions/chat';
import Navbar from '../../components/Navbar';
import { getChatOffice } from '../../actions/chatOffice';

class ChatUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser:'',
      activeSet: false,
      appt: null
    };
    this.onNewChat = this.onNewChat.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getChatUser({ appt: this.props.appt }));
   }

  componentWillReceiveProps(nextProps) {
    console.log('asdasdasda', nextProps);
    if (nextProps.chatUser && nextProps.chatUser.data && nextProps.chatUser.data.rooms && !this.state.activeSet) {
      this.setState({ activeSet: true });
      const roomId = nextProps.chatUser?.data?.rooms[0]?.id;
      this.props.dispatch(setActiveChat(roomId));
    }
  }

  onNewChat(e) {}

  render() {
    const { mobileState } = this.props;
    const filteredUsers = this.props.chatUser?.data?.users?.slice(0, 2) || [];
    console.log("look",this.props.currentUser)
    const chatUserData = {
      ...this.props.chatUser?.data,
      users: filteredUsers,
    };

    return (
      <>
        {(this.props.chatUser && this.props.chatUser.isReceiving) && (
          <AppSpinner />
        )}
        <div style={{ margin: 20 }}>
          {(this.props.chatUser && this.props.chatUser.data && this.props.chatUser.data.rooms) && (
            <>
              <ChatList onNewChat={this.onNewChat} data={chatUserData} />
              <ChatDialog data={chatUserData} />
              {(false && window.innerWidth > 1024) && (<ChatInfo data={chatUserData} />)}
            </>
          )}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    mobileState: state.chat.mobileState,
    chatUser: state.chatUser,
    createRoom: state.createRoom
  };
}

export default connect(mapStateToProps)(ChatUser);
