import React, { PureComponent } from 'react';
import Avatar from '../Avatar/Avatar';
import uuid from 'uuid/v4';
import moment from 'moment';
import s from './ChatMessage.module.scss';
import { decryptData } from '../../../utils/encryption';

class ChatMessage extends PureComponent {

  messageDate = (message) => {
    return moment(message.created).format('h:mm a')
  }

  decrypt(message) { 
    var dec = decryptData(message);
    return dec;
  } 

  render() {
    const { user, size, showStatus, message, showAvatar, owner } = this.props;
    return (
      <div className={`${s.chatMessage} ${owner ? s.owner : ''}`}>
        {showAvatar 
          ? <div className={`${s.messageAvatar}`}><Avatar user={user} size={size} showStatus={showStatus}/></div>
          :null}
      {message.text ? 
        <p className={s.messageBody}>
          {this.decrypt(message.text)}
        </p> :''}

      {message.attachments ? message.attachments.map(attachment => (
        <p key={uuid()} className={`${s.messageBody} ${s.messageAttachment}`}>
          {attachment.type === 'image' ?
          <img src={attachment.src} alt="attachment" />
          :null}
        </p>
      )) : null}

      <small className="d-block text-muted">
        {this.messageDate(message)}
      </small>
    </div>
    )
  }
}

export default ChatMessage;
