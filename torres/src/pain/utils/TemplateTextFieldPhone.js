import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

function TemplateTextFieldPhone({label,onChange,helpText,initialValue,style,value,readOnly,sx}) {

    var ip = null;
    if (readOnly) { 
        ip = {readOnly:true}
    } 
    if (!style) { style = {width:'100%'}}

    const onUpdate = (e) => { 
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        onChange({target:{value:validPhone}});
    } 

    return (
    <>
      <FormControl sx={{ m: 1}} style={style}>
          <TextField variant="outlined" label={label} value={value} style={style}
                InputProps={ip} sx={sx}
                onChange={onUpdate}/>
      </FormControl>
    </>
    )
}

export default TemplateTextFieldPhone;
