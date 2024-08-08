import React, { useState, Component, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';


function TemplateTextArea({label,onChange,helpText,initialValue,style,value,rows}) {

    return (
    <>
      <FormControl sx={{ m: style, width: "100%" }}>
       <TextField minRows={rows} value={value}
          style={style} multiline onChange={onChange} label={label}
        />
      </FormControl>
    </>
    )
}

export default TemplateTextArea;
