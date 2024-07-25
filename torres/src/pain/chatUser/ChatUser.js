import React, { Component } from 'react';
import { connect } from 'react-redux';
import ChatDialog from '../chatCommon/components/ChatDialog';
import ChatInfo from '../chatCommon/components/ChatInfo';
import ChatList from '../chatCommon/components/ChatList';
import { MobileChatStates } from '../../reducers/chat';
import s from './Chat.module.scss';
import { getChatUser } from '../../actions/chatUser';
import { setActiveChat } from '../../actions/chat';
import AppSpinner from '../utils/Spinner';
import Navbar from '../../components/Navbar';

class ChatUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: '',
      activeSet: false,
      appt: null,
    };
    this.onNewChat = this.onNewChat.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getChatUser({ appt: this.props.appt }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chatUser && nextProps.chatUser.data && nextProps.chatUser.data.rooms && !this.state.activeSet) {
      this.setState({ activeSet: true });
      const roomId = nextProps.chatUser?.data?.rooms[0]?.id;
      this.props.dispatch(setActiveChat(roomId));
    }
  }

  onNewChat(e) {
    // Implement your new chat creation logic here
    console.log("New chat created", e);
  }

  render() {
    const { mobileState, chatUser } = this.props;
    const chatUserData = {
      ...chatUser?.data,
      users: chatUser?.data?.users,
    };

    return (
      <>
        {chatUser && chatUser.isReceiving && <AppSpinner />}
        <div style={{ margin: 20 }}>
          {chatUser && chatUser.data && chatUser.data.rooms && (
            <>
              <ChatList onNewChat={this.onNewChat} data={chatUserData} />
              <ChatDialog data={chatUserData} />
              {false && window.innerWidth > 1024 && <ChatInfo data={chatUserData} />}
            </>
          )}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  mobileState: state.chat.mobileState,
  chatUser: state.chatUser,
  createRoom: state.createRoom,
});

export default connect(mapStateToProps)(ChatUser);
