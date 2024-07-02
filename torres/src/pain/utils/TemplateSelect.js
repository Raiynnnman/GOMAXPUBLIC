import React, { useState, Component, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

function TemplateSelect({label,onChange,style,value,options,disabled}) {

    return (
    <>
      <FormControl sx={{ m:1,width: "100%" }} style={style} size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value.label ? value.label : value}
        disabled={disabled}
        label={label}
        onChange={onChange}
      >
        {options.map((e) => { 
            return (
                <MenuItem key={e.key ? e.key : e.value} value={e.value}>{e.label}</MenuItem>
            )
        })}
      </Select>
      </FormControl>
    </>
    )
}

export default TemplateSelect;
