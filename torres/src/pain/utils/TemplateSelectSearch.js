import React, { useState, Component, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';

function TemplateSelectSearch({label,onChange,style,value,options}) {

    return (
    <>
      <FormControl sx={{ m:1,width: "100%" }} style={style} size="small">
      <Autocomplete
        value={value.label ? value.label : value}
        label={label}
        options={options}
        renderInput={(params) => <TextField {...params} label="Office" />}
        onChange={onChange}
      />
      </FormControl>
    </>
    )
}

export default TemplateSelectSearch;
