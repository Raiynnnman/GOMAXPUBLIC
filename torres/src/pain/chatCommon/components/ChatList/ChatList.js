import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import ChatListItem from './ChatListItem';
import ChatSearch from '../ChatSearch';
import { setActiveChat } from '../../../../actions/chat';

class ChatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newChat: false,
    };
  }

  findUser = (id) => {
    return this.props.users.find((u) => u.id === id);
  };

  getChats = (isGroup) => {
    return this.props.chats
      .filter((chat) => chat.isGroup === isGroup && chat.users.indexOf(this.props.user.id) > -1)
      .map((chat) => {
        let interlocutors = [];
        chat.users.forEach((uid) => {
          if (uid !== this.props.user.id) {
            interlocutors.push(this.findUser(uid));
          }
        });
        let lastMessage = chat.messages[chat.messages.length - 1] || {};
        lastMessage.owner = lastMessage.userId === this.props.user.id;
        return {
          id: chat.id,
          isGroup,
          title: isGroup ? chat.name : `${interlocutors[0].name} ${interlocutors[0].surname}`,
          interlocutors,
          lastMessage,
        };
      });
  };

  addChat = () => {
    this.setState({ newChat: true });
  };

  onNewChat = (e) => {
    this.setState({ newChat: false });
    this.props.onNewChat(e);
  };

  resetChat = () => {
    this.props.dispatch(setActiveChat(0));
  };

  render() {
    const { activeChatId, data } = this.props;

    return (
      <div style={{ border: '1px solid #e3e3e3', borderRadius: '10px', padding: '16px' }}>
        {/* <ChatSearch /> */}
        <Divider style={{ margin: '16px 0' }} />
        <section style={{ marginBottom: 0 }}>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {data.rooms.map((chat, i) => (
              <ChatListItem
                key={chat.id}
                isActive={chat.id === activeChatId}
                chat={chat}
              />
            ))}
          </ul>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.chat.user,
  users: state.chat.users,
  chats: state.chat.chats,
  activeChatId: state.chat.activeChatId,
});

export default connect(mapStateToProps)(ChatList);
