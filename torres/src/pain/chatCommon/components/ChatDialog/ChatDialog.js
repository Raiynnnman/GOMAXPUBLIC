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

const chatURL = () => 'http://localhost:8000';

class ChatDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: '',
      message: '',
      socket: null,
      newMessages: [],
      currentChannel: 0,
      dialogParts: []
    };
    this.handleOutgoingMessage = this.handleOutgoingMessage.bind(this);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.joinChannel = this.joinChannel.bind(this);
    this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeChatId !== this.state.currentChannel) {
      this.joinChannel(nextProps.activeChatId);
    }
  }

  componentDidMount() {
    let dialogParts = this.dialogParts();
    this.setState({ dialogParts });
    var room = localStorage.getItem("chatroom");
    if (room) {
      room = JSON.parse(room);
      this.props.dispatch(setActiveChat(room.room_id));
    }
    this.joinChannel(this.props.activeChatId);
    if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) {
      setTimeout(() => (this.chatDialogBodyRef.scrollBottom = this.chatDialogBodyRef.scrollHeight), 10);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      let dialogParts = this.dialogParts();
      this.setState({ dialogParts });
      if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) {
        setTimeout(() => {
          this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight;
        }, 10);
      }
    }
  }

  joinChannel(activeChatId) {
    var room = this.props.data.rooms.filter((room) => room.id === activeChatId);
    if (room.length > 0) {
      if (this.state.socket !== null) {
        this.state.socket.close();
      }
      var lastMessageId = 0;
      if (room[0].chats) {
        var sortedChats = room[0].chats.sort((a, b) => (a.created > b.created ? -1 : 1));
        if (sortedChats.length > 0) {
          lastMessageId = sortedChats[0].id;
        }
      }
      var token = "Bearer " + localStorage.getItem("token");
      const newSocket = io.connect(chatURL(), {
        extraHeaders: { Authorization: token }
      });
      this.setState({ socket: newSocket, currentChannel: activeChatId }, () => {
        this.state.socket.on("message", this.handleIncomingMessage);
        this.state.socket.emit("joinRoom", { last: lastMessageId, room_id: room[0].id });
      });
    }
  }

  isSocketConnected() {
    return new Promise((resolve) => {
      if (this.state.socket && this.state.socket.connected) {
        resolve(true);
      } else if (this.state.socket) {
        this.state.socket.on('connect', () => {
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  }

  async handleOutgoingMessage(e) {
    e.preventDefault();
    const isConnected = await this.isSocketConnected();
    if (isConnected) {
      var encryptedMessage = encryptData(this.state.message);
      var params = {
        room_id: this.props.activeChatId,
        message: encryptedMessage
      };
      this.state.socket.emit("chat", params);
      if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) {
        this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight;
      }
      this.setState({ message: '' });
    } else {
      console.error("Socket is not connected");
    }
  }

  handleIncomingMessage(message) {
    this.setState((prevState) => ({
      newMessages: [...prevState.newMessages, message]
    }));
    this.props.dispatch(newMessageRequest({ dialogId: this.chat().id, message: message.text }));
    if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) {
      this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight;
    }
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
