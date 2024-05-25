import React, { useState, Component, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

function TextField({label,onChange,helpText,initialValue,width}) {

    const [value,onValueChange] = useState(initialValue);

    useEffect(() => { 
    },[value]);
    
    return (
        <FormControl style={{width:width,marginTop:20}}>
          <InputLabel htmlFor="my-input">{label}</InputLabel>
          <Input id="my-input" type="password" onChange={onChange} aria-describedby={helpText} />
          <FormHelperText></FormHelperText>
        </FormControl>
    )
}

export default TextField;
