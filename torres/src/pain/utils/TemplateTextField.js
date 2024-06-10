import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

function TemplateTextField({label,onChange,helpText,initialValue,style,value,readOnly,sx}) {

    var ip = null;
    if (readOnly) { 
        ip = {readOnly:true}
    } 
    if (!style) { style = {width:'100%'}}
    return (
    <>
      <FormControl sx={{ m: 1}} style={style}>
          <TextField variant="outlined" size="small" label={label} value={value} style={style}
                InputProps={ip} sx={sx}
                onChange={onChange}/>
      </FormControl>
    </>
    )
}

export default TemplateTextField;
