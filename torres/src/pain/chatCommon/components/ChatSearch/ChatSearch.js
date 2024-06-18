import React from 'react';
import s from './ChatSearch.module.scss';
import TemplateTextField from '../../../utils/TemplateTextField';

const ChatSearch = (props) => (
    <div> 
    <TemplateTextField style={{width:"90%",margin:10}} label="Search" />
    </div>
)

export default ChatSearch;
