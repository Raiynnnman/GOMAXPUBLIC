import React, { useState, Component, useEffect } from 'react';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';


function TemplateTextArea({label,onChange,helpText,initialValue,style,value,rows}) {

    return (
    <>
      <FormControl sx={{ m: 1, width: "100%" }}>
        <InputLabel>{label}</InputLabel>
        <TextareaAutosize minRows={rows} value={value} style={style}
            onChange={onChange}/>
      </FormControl>
    </>
    )
}

export default TemplateTextArea;
