import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import ChatMessage from './ChatMessage';
import OnlineStatus from '../OnlineStatus';
import {
  newMessageRequest,
  changeMobileState,
  setActiveChat,
} from '../../../../actions/chat';
import { MobileChatStates } from '../../../../reducers/chat';
import s from './ChatDialog.module.scss';
import { chatURL } from '../../../../chatConfig';
import { chatUploadDoc } from '../../../../actions/chatUploadDoc';
import AppSpinner from '../../../utils/Spinner';
import { encryptData } from '../../../utils/encryption';
import TemplateButton from '../../../utils/TemplateButton';
import TemplateTextField from '../../../utils/TemplateTextField';

class ChatDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: '',
      message: '',
      socket: null,
      newMessages: [],
      currentChannel: 0,
      dialogParts: [],
    };
  }

  componentDidMount() {
    this.setState({ dialogParts: this.dialogParts() });
    const room = JSON.parse(localStorage.getItem('chatroom'));
    if (room) this.props.dispatch(setActiveChat(room.room_id));
    this.setupSocket();
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ dialogParts: this.dialogParts() });
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.state.socket?.disconnect();
  }

  setupSocket() {
    const token = `Bearer ${localStorage.getItem('token')}`;
    const socket = io(chatURL(), { extraHeaders: { Authorization: token } });
    socket.on('connect', () => {
      console.log('Socket connected');
      this.joinChannel(this.props.activeChatId);
    });

    socket.on('connect_error', (err) => console.error('Connection Error: ', err));
    socket.on('disconnect', () => console.log('Socket disconnected'));
    socket.on('message', this.handleIncomingMessage);

    this.setState({ socket });
  }

  joinChannel(activeChatId) {
    const room = this.props.data?.rooms.find((room) => room.id === activeChatId);
    if (room && this.state.socket) {
      const last = room.chats?.sort((a, b) => (a.created > b.created ? -1 : 1))[0]?.id || 0;
      this.state.socket.emit('joinRoom', { last, room_id: room.id });
      this.setState({ currentChannel: activeChatId });
    }
  }

  handleOutgoingMessage = (e) => {
    e.preventDefault();
    const { message, socket, currentChannel } = this.state;
    if (message.trim() && socket) {
      const encryptedMessage = encryptData(message);
      socket.emit('chat', { room_id: currentChannel, message: encryptedMessage });
      this.setState({ message: '' }, this.scrollToBottom);
    }
  };

  handleIncomingMessage = (message) => {
    this.setState(
      (prevState) => ({ newMessages: [...prevState.newMessages, message] }),
      () => {
        this.props.dispatch(newMessageRequest({ dialogId: this.chat().id, message: message.text }));
        this.scrollToBottom();
      }
    );
  };

  handleChange = (e) => {
    this.setState({ message: e.target.value ?? '' });
  };

  scrollToBottom = () => {
    if (this.chatDialogBodyRef) {
      setTimeout(() => {
        this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight;
      }, 10);
    }
  };

  chat = () => {
    return this.props.data.rooms.find((chat) => chat.id === this.props.activeChatId) || {};
  };

  title = () => {
    const chat = this.chat();
    return chat.isGroup ? chat.name : `${this.interlocutor().name} ${this.interlocutor().surname}`;
  };

  dialogParts = () => {
    const chat = this.chat();
    if (!chat.id) return [];
    if (this.state.newMessages.length) {
      chat.chats = [...chat.chats, ...this.state.newMessages];
      this.setState({ newMessages: [] });
    }
    if (!chat.chats?.length) return [];

    let dialogParts = [[this.shortCalendarDate(chat.chats[0].created)], [chat.chats[0]]];
    for (let i = 1; i < chat.chats.length; i++) {
      const lastDialogPart = dialogParts[dialogParts.length - 1];
      const prevMessage = lastDialogPart[lastDialogPart.length - 1];
      const message = chat.chats[i];
      const messageDate = moment(message.created).format('YYYY MM DD');
      const prevMessageDate = moment(prevMessage.created).format('YYYY MM DD');
      const shortDate = this.shortCalendarDate(message.created);
      const index = dialogParts.findIndex((e) => e[0] === shortDate);

      if (messageDate === prevMessageDate) {
        lastDialogPart.push(message);
      } else if (index !== -1) {
        dialogParts[index + 1].push(message);
      } else {
        dialogParts.push([this.shortCalendarDate(message.created)], [message]);
      }
    }

    return dialogParts.reduce((acc, cur, idx, src) => {
      if (idx % 2 === 0) acc.push(src[idx + 1], src[idx]);
      return acc;
    }, []);
  };

  interlocutor = () => {
    if (this.chat().isGroup) return;
    return this.findInterlocutor(this.chat()) || {};
  };

  findInterlocutor = (chat) => {
    if (!chat?.id) return null;
    const id = this.props.data.users.find((uid) => uid !== this.props.currentUser.id);
    return this.findUser(id);
  };

  findUser = (userId) => {
    if (!userId) return null;
    return this.props.data.users.find((user) => user.id === userId);
  };

  shortCalendarDate = (date) => {
    return moment(date).calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] dddd',
      sameElse: 'dddd, MMMM Do',
    });
  };

  isTimeDivider = (dialogPart) => {
    return typeof dialogPart[0] === 'string';
  };

  showAvatar = (dialogPart, message, index) => {
    return true;
  };

  newMessage = (e) => {
    e.preventDefault();
    this.setState({ newMessage: '' });
    this.props.dispatch(newMessageRequest({ dialogId: this.chat().id, message: this.state.newMessage }));
  };

  readDataAsUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  onChangeInputFiles = (e) => {
    Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((files) => {
      const room = this.props.data.rooms.find((room) => room.id === this.props.activeChatId);
      this.props.dispatch(
        chatUploadDoc({
          user_id: this.props.currentUser.id,
          room_id: this.props.activeChatId,
          appt_id: room.appt.id,
          content: [files[0]],
        })
      );
    });
  };

  render() {
    const { sendingMessage, chatUploadDoc } = this.props;
    const { dialogParts, message } = this.state;
    return (
      <>
        {chatUploadDoc?.isReceiving && <AppSpinner />}
        <div className={`d-flex flex-column chat-dialog-section`} style={{ height: 300, overflow: 'auto', border: '1px solid #e3e3e3', borderRadius: '10px', boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px' }}>
          <header className={s.chatDialogHeader}>
            <div>
              {false && <h5 className="fw-normal mb-0">{this.title()}</h5>}
              {false && !this.chat().isGroup ? <OnlineStatus user={this.interlocutor()} /> : null}
            </div>
          </header>
          <div className={s.chatDialogBody} ref={(chatDialogBody) => (this.chatDialogBodyRef = chatDialogBody)}>
            {dialogParts.map((part) =>
              this.isTimeDivider(part) ? (
                <div key={uuidv4()} className={s.dialogDivider}>
                  {part[0]}
                </div>
              ) : (
                <div key={uuidv4()} className={s.dialogMessage}>
                  {part
                    .sort((a, b) => (a.created > b.created ? 1 : -1))
                    .map((message, j) => (
                      <ChatMessage
                        key={message.id}
                        user={message.from_user_id === this.props.currentUser.id ? this.props.currentUser : this.findUser(message.from_user_id)}
                        owner={message.from_user_id === this.props.currentUser.id}
                        size={40}
                        showStatus={false}
                        message={message}
                        showAvatar={this.showAvatar(part, message, j)}
                      />
                    ))}
                </div>
              )
            )}
          </div>
          <form className={`chat-section ${s.newMessage} mb-0`} onSubmit={this.newMessage}>
            <label style={{ cursor: 'pointer' }} htmlFor="file-upload" className="custom-file-upload">
              <div className={s.attachment}>
                <i className="la la-plus"></i>
              </div>
            </label>
            <input onChange={this.onChangeInputFiles} id="file-upload" type="file" />
            <TemplateTextField onChange={this.handleChange} value={message || ''} label="Message" />
            <TemplateButton color="danger" onClick={this.handleOutgoingMessage} className={`px-4 ${s.newMessageBtn}`} type="submit" label={sendingMessage ? '' : <span>Send</span>} />
          </form>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
  chats: state.chat.chats,
  sendingMessage: state.chat.sendingMessage,
  chatUploadDoc: state.chatUploadDoc,
  activeChatId: state.chat.activeChatId,
});

export default connect(mapStateToProps)(ChatDialog);
