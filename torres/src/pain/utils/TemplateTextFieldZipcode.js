import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import formatPhoneNumber from './formatPhone';

function TemplateTextFieldZipcode({label,onChange,helpText,initialValue,style,value,readOnly,sx}) {

    var ip = null;
    if (readOnly) { 
        ip = {readOnly:true}
    } 
    if (!style) { style = {width:'100%'}}

    const onUpdate = (e) => { 
        if (e.target.value.length > 5) { return; }
        onChange({target:{value:e.target.value}});
    } 

    return (
    <>
      <FormControl sx={{ m: 1}} style={style}>
          <TextField size="small" variant="outlined" label={label} value={formatPhoneNumber(value)} style={style}
                InputProps={ip} sx={sx}
                onChange={onUpdate}/>
      </FormControl>
    </>
    )
}

export default TemplateTextFieldZipcode;
