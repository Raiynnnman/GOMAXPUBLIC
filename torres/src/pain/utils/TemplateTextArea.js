import React, { useState, Component, useEffect } from 'react';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';


function TemplateTextArea({label,onChange,helpText,initialValue,style,value,rows}) {

    return (
    <>
        <TextareaAutosize minRows={rows} value={value} style={style}
            onChange={onChange}/>
    </>
    )
}

export default TemplateTextArea;
