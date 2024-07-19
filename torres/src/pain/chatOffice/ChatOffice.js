import React, { Component } from 'react';
import ChatDialog from '../chatCommon/components/ChatDialog/ChatDialog';
import ChatInfo from '../chatCommon/components/ChatInfo/ChatInfo';
import ChatList from '../chatCommon/components/ChatList/ChatList';
import { connect } from 'react-redux';
import { MobileChatStates } from '../../reducers/chat';
import s from './Chat.module.scss';
import { getChatUser } from '../../actions/chatUser';
import { push } from 'connected-react-router';
import { createRoom } from '../../actions/createRoom';
import AppSpinner from '../utils/Spinner';
import { setActiveChat } from '../../actions/chat';
import Navbar from '../../components/Navbar';

class ChatOffice extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeSet: false,
            appt:null
        }
        this.onNewChat = this.onNewChat.bind(this)
    }
    componentDidMount() {
        this.props.dispatch(getChatUser({appt:this.props.appt}))
    }
    componentWillReceiveProps(p) { 
        // if (p.chatUser && p.chatUser.data && p.chatUser.data.rooms && !this.state.activeSet) { 
        //     this.state.activeSet = true;
        //     var t = p.chatUser.data.rooms[0].id
        //     this.props.dispatch(setActiveChat(t))
        //     this.setState(this.state);
        // } 
    }
    onNewChat(e) { 
    }
    render() {
        const { mobileState } = this.props;
        return (
        <>
            {(this.props.chatUser && this.props.chatUser.isReceiving) && (
                <AppSpinner/>
            )}
          <div style={{margin:20}}>
                 {(this.props.chatUser && this.props.chatUser.data && this.props.chatUser.data.rooms) && ( 
                <>
                    <Navbar/>
                    <ChatList onNewChat={this.onNewChat} data={this.props.chatUser.data}/>
                    <ChatDialog data={this.props.chatUser.data}/>
                    {(false && window.innerWidth > 1024) && ( <ChatInfo data={this.props.chatUser.data}/>)}
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
    chatUser: state.chatUser,
    createRoom: state.createRoom
  }
}

export default connect(mapStateToProps)(ChatOffice);
