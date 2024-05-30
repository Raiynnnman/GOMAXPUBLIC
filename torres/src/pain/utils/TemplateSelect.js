import React, { useState, Component, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

function TemplateSelect({label,onChange,style,value,options}) {

    return (
    <>
      <FormControl sx={{ m: 1, width: "100%" }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value.label ? value.label : value}
        style={style}
        label={label}
        onChange={onChange}
      >
        {options.map((e) => { 
            return (
                <MenuItem value={e.value}>{e.label}</MenuItem>
            )
        })}
      </Select>
      </FormControl>
    </>
    )
}

export default TemplateSelect;
