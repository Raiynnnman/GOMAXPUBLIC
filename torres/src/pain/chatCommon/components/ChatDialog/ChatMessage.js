import React, { PureComponent } from 'react';
import Avatar from '../Avatar/Avatar';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { decryptData } from '../../../utils/encryption';
import { Box, Typography, Avatar as MuiAvatar } from '@mui/material';
import { styled } from '@mui/system';

const ChatContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '5px',  
});

const ChatBubble = styled(Box)(({ theme, owner }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  maxWidth: '70%',
  wordBreak: 'break-word',
  alignSelf: owner ? 'flex-end' : 'flex-start',
  backgroundColor: owner ? '#ffa726' : '#eeeeee',  
  color: owner ? '#ffffff' : '#000000',  
  marginLeft: owner ? 'auto' : '0',  
  marginRight: owner ? '0' : 'auto',  
}));

const MessageText = styled(Typography)({
  margin: '5px 0',
  lineHeight: 1.4,
});

const AvatarAndTime = styled(Box)(({ owner }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: owner ? 'flex-end' : 'flex-start',
  marginTop: '5px',
  marginLeft: owner ? 'auto' : '0',
  marginRight: owner ? '0' : 'auto',
}));

class ChatMessage extends PureComponent {

  messageDate = (message) => {
    return moment(message.created).format('h:mm a');
  }

  decrypt(message) { 
    return decryptData(message);
  } 

  render() {
    const { user, size, showStatus, message, showAvatar, owner } = this.props;

    return (
      <ChatContainer>
        <ChatBubble owner={owner}>
          {message.text && 
            <MessageText variant="body2">
              {this.decrypt(message.text)}
            </MessageText>
          }
          {message.attachments && message.attachments.map(attachment => (
            <MessageText key={uuidv4()} variant="body2">
              {attachment.type === 'image' && <img src={attachment.src} alt="attachment" />}
            </MessageText>
          ))}
        </ChatBubble>
        <AvatarAndTime owner={owner}>
          {showAvatar && <Avatar user={user} size={size} showStatus={showStatus} />}
          <Typography variant="caption" color="textSecondary" style={{ marginLeft: owner ? '8px' : '0', marginRight: owner ? '0' : '8px' }}>
            {this.messageDate(message)}
          </Typography>
        </AvatarAndTime>
      </ChatContainer>
    );
  }
}

export default ChatMessage;
