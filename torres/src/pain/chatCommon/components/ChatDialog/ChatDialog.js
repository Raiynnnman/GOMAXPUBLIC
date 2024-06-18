import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
//import Loader from '../../../../components/Loader';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import OnlineStatus from '../OnlineStatus';
import { newMessageRequest, changeMobileState } from '../../../../actions/chat';
import { MobileChatStates } from '../../../../reducers/chat';
import s from './ChatDialog.module.scss';
import io from 'socket.io-client';
import { chatURL } from '../../../../chatConfig';
import { chatUploadDoc } from '../../../../actions/chatUploadDoc';
import AppSpinner from '../../../utils/Spinner';
import { encryptData, decryptData } from '../../../utils/encryption';
import { setActiveChat } from '../../../../actions/chat';
import TemplateButton from '../../../utils/TemplateButton';
import TemplateTextField from '../../../utils/TemplateTextField';

class ChatDialog extends Component {

    constructor(props) { 
        super(props);
        this.state = {
            newMessage: '', 
            message:'',
            socket: null,
            newMessages:[],
            currentChannel:0,
            dialogParts: []
        }
        this.handleOutgoingMessage = this.handleOutgoingMessage.bind(this);
        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
        this.joinChannel = this.joinChannel.bind(this);
        this.onChangeInputFiles = this.onChangeInputFiles.bind(this);
    }

    componentWillReceiveProps(p) { 
        if (p.activeChatId !== this.state.currentChannel) { 
            this.joinChannel(p.activeChatId);
        }
    } 

    componentDidMount() {
        let dialogParts = this.dialogParts();
        this.setState({ dialogParts });
        var room = localStorage.getItem("chatroom");
        if (room) { 
            room = JSON.parse(room);
            this.props.dispatch(setActiveChat(room.room_id))
        } 
        this.joinChannel(this.props.activeChatId);
        if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) { 
            setTimeout(() => this.chatDialogBodyRef.scrollBottom = this.chatDialogBodyRef.scrollHeight,10)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps !== this.props) {
          let dialogParts = this.dialogParts();
          this.setState({ dialogParts })      
          if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) { 
            setTimeout(() => { 
                this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight
                //this.chatDialogBodyRef.scrollIntoView({behavior: 'smooth'});
            },10) 
          }
        }
    }

    joinChannel(aci) { 
        var t = this.props.data.rooms.filter((e) => e.id === aci)
        if (t.length > 0) { 
            this.state.currentChannel = aci;
            if (this.state.socket !== null) { 
                this.state.socket.close();
            } 
            var last = 0;
            var l = t[0].chats.sort((a,b) => (a.created > b.created ? -1:1))
            if (l.length > 0) { 
                last = l[0].id
            } 
            var token = "Bearer " + localStorage.getItem("token");
            this.state.socket = io.connect(chatURL(), { 
                extraHeaders: { Authorization: token }
            });
            this.state.socket.on("message", (data) => {
                this.handleIncomingMessage(data)
            })
            this.state.socket.emit("joinRoom", { last: last, room_id: t[0].id}, function(d,c) {
            });
            this.setState(this.state);
        }
    } 

    handleOutgoingMessage(e) { 
        var enc = encryptData(this.state.message);
        var params = { 
            room_id: this.props.activeChatId,
            message: enc
        } 
        this.state.socket.emit("chat",params, function(d,c) {
        });
        if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) { 
            this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight
        }
    }

    handleIncomingMessage(e) { 
        //e['text'] = decryptData(e.text);
        this.state.newMessages.push(e)
        this.setState(this.state);
        this.props.dispatch(newMessageRequest({dialogId: this.chat().id, message: e.text}))
        if (this.chatDialogBodyRef && this.chatDialogBodyRef.scrollHeight) { 
            this.chatDialogBodyRef.scrollTop = this.chatDialogBodyRef.scrollHeight
        }
    }



    handleChange = (e) => {
        console.log("e",e);
        this.state.message = e.target.value;
        this.setState(this.state)
    }

    chat = () => {
        //return this.props.chats.find(chat => chat.id === this.props.activeChatId) || {};
        var t = this.props.data.rooms.find(chat => chat.id === this.props.activeChatId) || {};
        return t
    }

    title = () => {
        return this.chat().isGroup ? this.chat().name : `${this.interlocutor().name} ${this.interlocutor().surname}`
    }

  dialogParts = () => {
    if (!this.chat().id) {
      return [];
    }
    var mychat = this.chat()
    if (this.state.newMessages.length > 0) { 
        mychat.chats = mychat.chats.concat(this.state.newMessages);
        this.state.newMessages = []
    } 
    if (mychat.chats.length < 1) { return []; }
    let firstMessage = mychat.chats[0];
    let dialogParts = [[this.shortCalendarDate(firstMessage.created)],[firstMessage]];
    let messagesLength = mychat.chats.length;

    for (let i = 1; i < messagesLength; i++) {
      let lastDialogPart = dialogParts[dialogParts.length - 1];
      let prevMessage = lastDialogPart[lastDialogPart.length - 1];
      let message = mychat.chats[i];
      let messageDate = moment(message.created).format('YYYY MM dd');
      let prevMessageDate = moment(prevMessage.created).format('YYYY MM dd');
      let shortDate = this.shortCalendarDate(message.created)
      var t = dialogParts.findIndex((e) => e[0] === shortDate);
      if (messageDate === prevMessageDate) {
        lastDialogPart.push(message);
      } else {
        if (t !== -1) { 
            dialogParts[t+1].push(message);
        } else { 
            dialogParts.push([this.shortCalendarDate(message.created)], [message]);
        }
      }
    }
    var newOrder = []
    var c = 0 ;
    for (c=dialogParts.length - 1;c > 0;c-=2) { 
        newOrder.push(dialogParts[c-1])
        newOrder.push(dialogParts[c])
    } 
    dialogParts = newOrder
    return dialogParts;
  }

  interlocutor = () => {
    if(this.chat().isGroup) {
      return
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

  findUser = (e) => {
    if (!e) { return null; }
    return this.props.data.users.find(u => u.id === e);
  }

  shortCalendarDate = (date) => {
    return moment(date).calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] dddd',
      sameElse: 'dddd, MMMM Do'
    })
  }

  isTimeDivider = (dialogPart) => {
    return typeof dialogPart[0] === 'string';
  }

  showAvatar = (dialogPart, message, index) => {
    return true;
    //return index === 0 || dialogPart[index - 1].userId !== message.userId;
  }

  newMessage = (e) => {
      e.preventDefault();
      this.setState({ newMessage: '' })
          this.props.dispatch(newMessageRequest({dialogId: this.chat().id, message: this.state.newMessage}))
  }

  readDataAsUrl = (file) => { 
        return new Promise ((resolve,reject) => { 
            var reader = new FileReader();
            reader.content = null;
            reader.onload = function(e,s) { 
                resolve(e.target.result)
            } 
            reader.readAsDataURL(file)
            
        })
  }

  onChangeInputFiles(e) {
        const files = [];
        let i = 0;
        //this.state.selected.documents[0]['mime'] = e.target.files[0].type
        Promise.all(Array.from(e.target.files).map(this.readDataAsUrl)).then((g) => { 
            var t = this.props.data.rooms.find((e) => e.id === this.props.activeChatId)
            var params = { 
                user_id:this.props.currentUser.id,
                room_id:this.props.activeChatId,
                appt_id:t.appt.id,
                content:[g[0]]
            } 
            this.props.dispatch(chatUploadDoc(params));
        }) 
  }
  
  render() {
    if(this.state.socket && !this.state.socket.connected) { 
        console.log("Disconnected"); // DEBUG
    } 
    const { sendingMessage, user } = this.props;
    const { dialogParts } = this.state;
    console.log("p",this.props);
    return (
    <>
    {(this.props.chatUploadDoc && this.props.chatUploadDoc.isReceiving) && (
        <AppSpinner/>
    )}
    <div className={`d-flex flex-column chat-dialog-section`} 
        style={{border:"1px solid #e3e3e3",borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
      <header className={s.chatDialogHeader}>
        <div>
          {/* TODO: Put header back in */}
          {false && (<h5 className="fw-normal mb-0">{this.title()}</h5>)}
          {false && !this.chat().isGroup ?
            <OnlineStatus user={this.interlocutor()} />
          :null}
        </div>
        {/*<i className={`${s.infoIcon} la la-ellipsis-v d-none d-xl-inline-block`}></i>
        <i className={`${s.infoIcon} la la-ellipsis-v d-xl-none`} onClick={() => this.props.dispatch(changeMobileState(MobileChatStates.INFO))}></i>
        */}
      </header>
      <div className={s.chatDialogBody} 
        ref={chatDialogBody => {
          this.chatDialogBodyRef = chatDialogBody;
        }}
      >
        {dialogParts.map((part,i) => {
          if(this.isTimeDivider(part)) {
            return (
              <div key={uuidv4()} className={s.dialogDivider}>{part[0]}</div>
            )
          } else {
            return (
              <div key={uuidv4()} className={s.dialogMessage} >
                {part.sort((a,b) => (a.created > b.created ? 1:-1)).map((message, j) => 
                  <>
                  <ChatMessage 
                    user={message.from_user_id === this.props.currentUser.id ? this.props.currentUser : this.findUser(message.from_user_id)}
                    owner={message.from_user_id === this.props.currentUser.id}
                    size={40}
                    showStatus={false}
                    key={message.id}
                    message={message}
                    showAvatar={this.showAvatar(part,message,j)}
                  />            
                  </>
                )}
              </div>
            )
          }
        })}
      </div>
      <form className={`chat-section ${s.newMessage} mb-0`} onSubmit={this.newMessage}>
        <label style={{cursor:'pointer'}} for="file-upload" class="custom-file-upload">
            <div className={s.attachment} outline>
                <i className="la la-plus"></i>
            </div>
        </label>
        <input onChange={this.onChangeInputFiles} id="file-upload" type="file"/>
        <TemplateTextField onChange={this.handleChange} value={this.state.message} label="Message"/>
        <TemplateButton color="danger" onClick={this.handleOutgoingMessage} className={`px-4 ${s.newMessageBtn}`} type="submit" 
          label={sendingMessage ? "" : <span>Send</span>}/>
      </form>
    </div>    
    </>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
    chats: state.chat.chats,
    //user: state.chat.user,
    sendingMessage: state.chat.sendingMessage,
    chatUploadDoc: state.chatUploadDoc,
    activeChatId: state.chat.activeChatId,
  }
}

export default connect(mapStateToProps)(ChatDialog)
