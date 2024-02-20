import React, { Component } from 'react';
import Select from 'react-select';
import { Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import ChatListItem from './ChatListItem';
import ChatSearch from '../ChatSearch';
import s from './ChatList.module.scss';
import { Button } from 'reactstrap'; 
import { setActiveChat } from '../../../../actions/chat';

class ChatList extends Component {
  constructor(props) { 
    super(props);
    this.state = { 
        newChat: false
    } 
    this.onNewChat = this.onNewChat.bind(this);
    this.addChat = this.addChat.bind(this);
    this.resetChat = this.resetChat.bind(this);
  }
  findUser = (id) => {
    return this.props.users.find(u => u.id === id);
  }

  getChats = (isGroup) => {
    return this.props.chats
      .filter(chat => {
        return chat.isGroup === isGroup && chat.users.indexOf(this.props.user.id) > -1
      })
      .map(chat => {
        let interlocutors = [];
        chat.users.forEach(uid => {
          if (uid !== this.props.user.id) {
            interlocutors.push(this.findUser(uid));
          }
        });
        let lastMessage = chat.messages[chat.messages.length - 1] || {};
        lastMessage.owner = lastMessage.userId === this.props.user.id;
        return {
          id: chat.id,
          isGroup,
          title: isGroup ? chat.name : interlocutors[0].name + " " + interlocutors[0].surname,
          interlocutors,
          lastMessage
        }
      });
  }
  addChat() { 
    this.state.newChat = true;
    this.setState(this.state);
  }
  onNewChat(e) { 
    this.state.newChat = false;
    this.setState(this.state);
    this.props.onNewChat(e);
  }
  resetChat() { 
    this.props.dispatch(setActiveChat(0))
  } 

  render() {
  const { activeChatId } = this.props;
  return (
    <div className={`chat-list-section`} 
        style={{border:"1px solid #e3e3e3",borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
      <ChatSearch />
      <section className={`chat-section ${s.chatsSectionWrap} ${s.personalChats} d-none d-lg-block mb-0`}>
        <Row md="12">
            <Col md="3">
                <div onClick={this.resetChat} style={{cursor:"pointer"}}>
                    <h5>Chats</h5> 
                </div>
            </Col>
            {(this.state.newChat) && ( 
                <Col md="9">
                      <Select
                          closeMenuOnSelect={true}
                          isSearchable={false}
                          onChange={this.onNewChat}
                          options={this.props.data.users.map((e) => { 
                            return ({ 
                                label:e.first_name + " " + e.last_name,
                                value: e.id
                            })
                          })}
                       />
                </Col>
            )}
            {(false && !this.state.newChat) && ( 
            <>
                <Col md="5"></Col>
                <Col md="4">
                    {(!this.state.newChat) && ( <Button onClick={this.addChat} class="pull-right" color="primary">New</Button> )}
                </Col>
            </>
            )}
        </Row>
        <ul className={`${s.chatList}`}>
          {this.props.data.rooms.map((chat, i) => (
            <ChatListItem
              key={chat.id}
              isActive={chat.id === activeChatId ? true : false}
              chat={chat} />
          ))}
        </ul>
      </section>
      {(1 === 0) && ( 
      <section className={`chat-section mb-0 d-lg-none ${s.allChats}`}>
        <h5>Group chats0</h5>
        <ul className={`${s.chatList} mb-3`}>
          {this.getChats(true).map((chat, i) => (
            <ChatListItem
              key={chat.id}
              isActive={chat.id === activeChatId ? true : false}
              chat={chat} />
          ))}
        </ul>
        <h5>Group chats1</h5>
        <ul className={`${s.chatList}`}>
          {this.getChats(false).map((chat, i) => (
            <ChatListItem
              key={chat.id}
              isActive={chat.id === activeChatId ? true : false}
              chat={chat} />
          ))}
        </ul>
      </section>
      )}
    </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.chat.user,
    users: state.chat.users,
    chats: state.chat.chats,
    activeChatId: state.chat.activeChatId, 
    sendingMessage: state.chat.sendingMessage
  }
}

export default connect(mapStateToProps)(ChatList);
