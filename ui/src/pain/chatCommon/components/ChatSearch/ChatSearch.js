import React from 'react';
import {
    InputGroup,
    Input,
} from 'reactstrap';
import s from './ChatSearch.module.scss';

const ChatSearch = (props) => (
    <div className={`${s.searchBox} chat-section bg-white ${props.classProp ? props.classProp : ""}`} 
        style={{border:"1px solid #e3e3e3",borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
    <InputGroup className={'input-group-no-border'}>
    <Input className={s.chatInput} placeholder="Search" />
    <div className={s.inputIcon} ><i className="la la-search"/></div>
    </InputGroup>
    </div>
)

export default ChatSearch;
