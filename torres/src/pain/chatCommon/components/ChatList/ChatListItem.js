import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Avatar from '../Avatar';
import { connect } from 'react-redux';
import moment from 'moment';
import people from '../../../../assets/chat/people.svg';
import { setActiveChat } from '../../../../actions/chat';
import s from './ChatList.module.scss';

class ChatListItem extends Component {

  time = () => {
  }

  chatUsers = () => {
    return []
    if (this.props.chat.interlocutors.length <= 2) {
      return [...this.props.chat.interlocutors, this.props.user];
    } else {
      return this.props.chat.interlocutors.slice(0, 3);
    }
  }

  changeChat = () => {
    this.props.dispatch(setActiveChat(this.props.chat.id))
  }

  findUser = (id) => {
    return this.props.users.find(u => u.id === id);
  }


  render() {
    const { chat, isActive } = this.props;
    return (
      <li 
        onClick={this.changeChat}
        className={`${s.chatListItem} ${isActive ? s.active : ''}`}>
        <div className={`${s.chatListItemWrapper}`}>
          {(false && !chat.isGroup) ? 
          <Avatar user={chat.interlocutors[0]} size={45} className="me-3" showStatus={true} />
          : <ul className={s.avatarsColumn}>
              {this.chatUsers().map(user => (
                <li key={uuidv4()}><Avatar user={user} size={35} showStatus={false} className="me-3" stroke={true} /></li>
              ))}
            </ul>
          }
        
        <section> 
          <header className="d-flex align-items-center justify-content-between mb-1">
            <h6 style={{backgroundColor:'white',color:'black'}}>
            {chat.isGroup ? <img alt="group" className={`${s.groupChatIcon} me-1`} src={people} /> : null}
            {chat.label} 
            {chat.isGroup ? <span>({chat.interlocutors.length})</span> : ''}
            </h6>
            
            <span className={`ms-auto ${s.timestamp}`}>
            {this.time()}
            </span>
          </header>
          <p className={`${s.chatLastMessage}`}>
            {(false && chat.lastMessage.owner) ? <span className={`${s.ownerIndicator} me-1`}> You:</span> : ''}
            {(false && chat.lastMessage.owner) && chat.isGroup ? <span className={`${s.ownerIndicator} me-1`}>{this.findUser(chat.lastMessage.userId)}</span> : ''}
            {(false && chat.lastMessage.text)  ? 'Write a first message' : ''}
          </p>
        </section>
      </div>
    </li>
    )
  }
}

function mapStateToProps (state) {
  return {
    activeChatId: state.chat.activeChatId,
    user: state.chat.user,
    users: state.chat.users,
    sendingMessage: state.chat.sendingMessage
  }
}

export default connect(mapStateToProps)(ChatListItem);
