import React, { useState, Component, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function TemplateTextField({label,onChange,helpText,initialValue,style,value,readOnly}) {

    var ip = null;
    if (readOnly) { 
        ip = {readOnly:true}
    } 
    if (!style) { style = {width:'95%'}}
    return (
    <>
      <FormControl sx={{ m: 1}} style={style}>
          <TextField variant="outlined" label={label} value={value} style={style}
                InputProps={ip}
                onChange={onChange}/>
      </FormControl>
    </>
    )
}

export default TemplateTextField;
