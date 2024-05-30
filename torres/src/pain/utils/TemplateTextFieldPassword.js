import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function TemplateTextFieldPassword({label,onChange,helpText,initialValue,style,value}) {

    return (
    <>
      <FormControl sx={{ m: 1, width: "100%" }}>
        <TextField style={style} variant="outlined" value={value}
            onChange={onChange} type="password"/>
      </FormControl>
    </>
    )
}

export default TemplateTextFieldPassword;
