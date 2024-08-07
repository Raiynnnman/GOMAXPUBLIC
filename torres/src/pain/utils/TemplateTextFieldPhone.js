import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import formatPhoneNumber from './formatPhone';

function TemplateTextFieldPhone({label,onChange,helpText,initialValue,style,value,readOnly,sx}) {

    var ip = null;
    if (readOnly) { 
        ip = {readOnly:true}
    } 
    if (!style) { style = {width:'100%'}}

    const onUpdate = (e) => { 
        let val = e.target.value.replace(/\D/g, "").match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        if (val[0].length > 10) { return; }
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        onChange({target:{value:validPhone}});
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

export default TemplateTextFieldPhone;
