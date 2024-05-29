import React, { useState, Component, useEffect } from 'react';
import TextField from '@mui/material/TextField';

function TemplateTextField({label,onChange,helpText,initialValue,style,value}) {

    return (
    <>
        <TextField label={label} variant="outlined" value={value} style={style}
            onChange={onChange}/>
    </>
    )
}

export default TextField;
