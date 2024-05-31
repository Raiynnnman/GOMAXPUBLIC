import React, { useState, Component, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

function TemplateSelect({label,onChange,style,value,options}) {

    return (
    <>
      <FormControl sx={{ m:1,width: "100%" }} style={style}>
      <InputLabel>{label + ':' + value}</InputLabel>
      </FormControl>
    </>
    )
}

export default TemplateSelect;
