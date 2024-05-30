import React, { useState, Component, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function TemplateTextField({label,onChange,helpText,initialValue,style,value}) {

    return (
    <>
      <FormControl sx={{ m: 1, width: "100%" }}>
          <TextField variant="outlined" value={value} style={style}
                onChange={onChange}/>
      </FormControl>
    </>
    )
}

export default TemplateTextField;
