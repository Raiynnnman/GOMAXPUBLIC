import React, { useState, Component, useEffect } from 'react';
import TextField from '@mui/material/TextField';

function TemplateTextFieldPassword({label,onChange,helpText,initialValue,width,value}) {

    
    return (
        <TextField label={label} variant="outlined" value={value}
            onChange={onChange} type="password"/>
    )
}

export default TextField;
