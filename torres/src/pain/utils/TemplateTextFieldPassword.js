import React from 'react';
import TextField from '@mui/material/TextField';

function TemplateTextFieldPassword({label,onChange,helpText,initialValue,style,value}) {

    return (
    <>
        <TextField style={style} label={label} variant="outlined" value={value}
            onChange={onChange} type="password"/>
    </>
    )
}

export default TemplateTextFieldPassword;
