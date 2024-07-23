import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import OnlineStatus from '../OnlineStatus';
import { newMessageRequest, changeMobileState } from '../../../../actions/chat';
import { MobileChatStates } from '../../../../reducers/chat';
import s from './ChatDialog.module.scss';
import io from 'socket.io-client';
import AppSpinner from '../../../utils/Spinner';
import { encryptData, decryptData } from '../../../utils/encryption';
import { setActiveChat } from '../../../../actions/chat';
import TemplateButton from '../../../utils/TemplateButton';
import TemplateTextField from '../../../utils/TemplateTextField';
import { chatUploadDoc } from '../../../../actions/chatUploadDoc';


const chatURL = 'http://localhost:8000';  // Ensure this matches your server configuration

class ChatDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      socket: null,
      newMessages: [],
      currentChannel: 0,
      dialogParts: [],
    };
    this.handleOutgoingMessage = this.handleOutgoingMessage.bind(this);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.joinChannel = this.joinChannel.bind(this);
    this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
  }

  componentDidMount() {
    this.initializeSocket();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeChatId !== this.state.currentChannel) {
      this.joinChannel(nextProps.activeChatId);
    }
  }

  initializeSocket() {
    const token = `Bearer ${localStorage.getItem('token')}`;
    const socket = io(chatURL, {
      extraHeaders: { Authorization: token },
      transports: ['websocket'],  // Ensure only WebSocket is used
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('connect_timeout', (timeout) => {
      console.error('Socket connection timeout:', timeout);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    socket.on('message', this.handleIncomingMessage);

    this.setState({ socket });
  }

  joinChannel(activeChatId) {
    const { socket } = this.state;
    const room = this.props.data.rooms.find((room) => room.id === activeChatId);
    if (room && socket) {
      socket.emit('joinRoom', { room_id: room.id });
      this.setState({ currentChannel: activeChatId });
    }
  }

  async handleOutgoingMessage(e) {
    e.preventDefault();
    const { socket, message } = this.state;
    if (socket && socket.connected) {
      const encryptedMessage = encryptData(message);
      const params = {
        room_id: this.props.activeChatId,
        message: encryptedMessage,
      };
      socket.emit('chat', params);
      this.setState({ message: '' });
    } else {
      console.error('Socket is not connected');
    }
  }

  handleIncomingMessage(message) {
    this.setState((prevState) => ({
      newMessages: [...prevState.newMessages, message],
    }));
    this.props.dispatch(newMessageRequest({ dialogId: this.chat().id, message: message.message }));
  }

  handleChange = (e) => {
    this.setState({ message: e.target.value });
  }

  chat = () => {
    return this.props.data.rooms.find(chat => chat.id === this.props.activeChatId) || {};
  }

  title = () => {
    return this.chat().isGroup ? this.chat().name : `${this.interlocutor().name} ${this.interlocutor().surname}`;
  }

  dialogParts = () => {
    if (!this.chat().id) {
      return [];
    }
    var chat = this.chat();
    if (this.state.newMessages.length > 0) {
      chat.chats = chat.chats.concat(this.state.newMessages);
      this.setState({ newMessages: [] });
    }
    if (!chat.chats || chat.chats.length < 1) {
      return [];
    }
    let dialogParts = [[this.shortCalendarDate(chat.chats[0].created)], [chat.chats[0]]];
    for (let i = 1; i < chat.chats.length; i++) {
      let lastDialogPart = dialogParts[dialogParts.length - 1];
      let prevMessage = lastDialogPart[lastDialogPart.length - 1];
      let message = chat.chats[i];
      let messageDate = moment(message.created).format('YYYY MM DD');
      let prevMessageDate = moment(prevMessage.created).format('YYYY MM DD');
      let shortDate = this.shortCalendarDate(message.created);
      var index = dialogParts.findIndex((e) => e[0] === shortDate);
      if (messageDate === prevMessageDate) {
        lastDialogPart.push(message);
      } else {
        if (index !== -1) {
          dialogParts[index + 1].push(message);
        } else {
          dialogParts.push([this.shortCalendarDate(message.created)], [message]);
        }
      }
    }
    dialogParts = dialogParts.reduce((acc, cur, idx, src) => {
      if (idx % 2 === 0) {
        acc.push(src[idx + 1], src[idx]);
      }
      return acc;
    }, []);
    this.setState({ dialogParts });
    return dialogParts;
  }

  interlocutor = () => {
    if (this.chat().isGroup) {
      return;
    }
    return this.findInterlocutor(this.chat()) || {};
  }

  findInterlocutor = (chat) => {
    if (!chat || !chat.id) {
      return null;
    }
    let id = this.props.data.users.find(uid => uid !== this.props.currentUser.id);
    return this.findUser(id);
  }

  findUser = (userId) => {
    if (!userId) {
      return null;
    }
    return this.props.data.users.find(user => user.id === userId);
  }

  shortCalendarDate = (date) => {
    return moment(date).calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] dddd',
      sameElse: 'dddd, MMMM Do'
    });
  }

  isTimeDivider = (dialogPart) => {
    return typeof dialogPart[0] === 'string';
  }

  showAvatar = (dialogPart, message, index) => {
    return true;
  }

  newMessage = (e) => {
    e.preventDefault();
    this.props.dispatch(newMessageRequest({ dialogId: this.chat().id, message: this.state.newMessage }));
    this.setState({ newMessage: '' });
  }

  readDataAsUrl = (file) => {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  onChangeInputFiles(e) {
    Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((files) => {
      var room = this.props.data.rooms.find((room) => room.id === this.props.activeChatId);
      var params = {
        user_id: this.props.currentUser.id,
        room_id: this.props.activeChatId,
        appt_id: room.appt.id,
        content: [files[0]]
      };
      this.props.dispatch(chatUploadDoc(params));
    });
  }

  render() {
    const { sendingMessage, user } = this.props;
    const { dialogParts } = this.state;
    return (
      <>
        {this.props.chatUploadDoc && this.props.chatUploadDoc.isReceiving && (
          <AppSpinner />
        )}
        <div className={`d-flex flex-column chat-dialog-section`}
          style={{ height: 300, overflow: "auto", border: "1px solid #e3e3e3", borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.15) 0px 5px 15px 0px" }}>
          <header className={s.chatDialogHeader}>
            <div>
              {false && (<h5 className="fw-normal mb-0">{this.title()}</h5>)}
              {false && !this.chat().isGroup ?
                <OnlineStatus user={this.interlocutor()} />
                : null}
            </div>
          </header>
          <div className={s.chatDialogBody}
            ref={chatDialogBody => {
              this.chatDialogBodyRef = chatDialogBody;
            }}
          >
            {dialogParts.map((part, i) => {
              if (this.isTimeDivider(part)) {
                return (
                  <div key={uuidv4()} className={s.dialogDivider}>{part[0]}</div>
                )
              } else {
                return (
                  <div key={uuidv4()} className={s.dialogMessage} >
                    {part.sort((a, b) => (a.created > b.created ? 1 : -1)).map((message, j) =>
                      <ChatMessage
                        user={message.from_user_id === this.props.currentUser.id ? this.props.currentUser : this.findUser(message.from_user_id)}
                        owner={message.from_user_id === this.props.currentUser.id}
                        size={40}
                        showStatus={false}
                        key={message.id}
                        message={message}
                        showAvatar={this.showAvatar(part, message, j)}
                      />
                    )}
                  </div>
                )
              }
            })}
          </div>
          <form className={`chat-section ${s.newMessage} mb-0`} onSubmit={this.newMessage}>
            <label style={{ cursor: 'pointer' }} htmlFor="file-upload" className="custom-file-upload">
              <div className={s.attachment} outline>
                <i className="la la-plus"></i>
              </div>
            </label>
            <input onChange={this.onChangeInputFiles} id="file-upload" type="file" />
            <TemplateTextField onChange={this.handleChange} value={this.state.message} label="Message" />
            <TemplateButton color="danger" onClick={this.handleOutgoingMessage} className={`px-4 ${s.newMessageBtn}`} type="submit"
              label={sendingMessage ? "" : <span>Send</span>} />
          </form>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
    chats: state.chat.chats,
    sendingMessage: state.chat.sendingMessage,
    chatUploadDoc: state.chatUploadDoc,
    activeChatId: state.chat.activeChatId,
  };
}

export default connect(mapStateToProps)(ChatDialog);
