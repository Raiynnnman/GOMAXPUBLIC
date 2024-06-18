import React, { Component } from 'react';
import ChatDialog from '../chatCommon/components/ChatDialog';
import ChatInfo from '../chatCommon/components/ChatInfo';
import ChatList from '../chatCommon/components/ChatList';
import { connect } from 'react-redux';
import { MobileChatStates } from '../../reducers/chat';
import s from './Chat.module.scss';
import { getChatOffice } from '../../actions/chatOffice';
import { push } from 'connected-react-router';
import { createRoom } from '../../actions/createRoom';
import AppSpinner from '../utils/Spinner';
import { setActiveChat } from '../../actions/chat';

class ChatOffice extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeSet: false 
        }
        this.onNewChat = this.onNewChat.bind(this)
    }
    componentDidMount() {
        this.props.dispatch(getChatOffice())
    }
    componentWillReceiveProps(p) { 
        if (false && p.chatUser && p.chatUser.data && p.chatUser.data.rooms && !this.state.activeSet) { 
            this.state.activeSet = true;
            var t = p.chatUser.data.rooms[0].id
            this.props.dispatch(setActiveChat(t))
            this.setState(this.state);
        } 
    }
    onNewChat(e) { 
    } 
    render() {
        const { mobileState } = this.props;
        return (
        <>
            {(this.props.chatOffice && this.props.chatOffice.isReceiving) && (
                <AppSpinner/>
            )}
          <div className={`chat-page-wrapper ${s.chatPage} ${mobileState === MobileChatStates.LIST ? 'list-state' : ''} ${mobileState === MobileChatStates.CHAT ? 'chat-state' : ''} ${mobileState === MobileChatStates.INFO ? 'info-state' : ''}`}>
            {(this.props.chatOffice && this.props.chatOffice.data && this.props.chatOffice.data.rooms) && ( 
                <>
                <ChatList onNewChat={this.onNewChat} data={this.props.chatOffice.data}/>
                <ChatDialog data={this.props.chatOffice.data}/>
                <ChatInfo data={this.props.chatOffice.data}/>
                </>
            )}
          </div>
        </>
        )
   }
}

function mapStateToProps(state) {
  return {
    mobileState: state.chat.mobileState,
    chatOffice: state.chatOffice,
    createRoom: state.createRoom
  }
}

export default connect(mapStateToProps)(ChatOffice);
