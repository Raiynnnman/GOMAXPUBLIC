import React, { useState, Component, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

function TemplateSelectMulti({label,onChange,style,value,options}) {
  var sel = []
  var c = 0;
  for (c = 0; c < value.length; c++) { 
    sel.push(value[c].label);
  } 
  const [selected, setSelected] = React.useState(sel);

  const handleDelete = (e) => { 
    var o = value.filter((f) => f.label !== e);
    var t = sel.filter((f) => f !== e);
    setSelected(t);
    onChange(o);
  }
  const handleChange = (e,t) => {
    setSelected(e.target.value);
    var c = 0;
    var n = []
    for (c=0;c < e.target.value.length; c++) { 
        var g = e.target.value[c];
        var h = 0; 
        for (h = 0; h < options.length; h++) { 
            if (g === options[h].label) { 
                n.push(options[h])
            } 
        } 
    } 
    onChange(n);
  };

  return (
    <div>
      <FormControl sx={{ m: 1, ml:2, width: "100%" }}>
        <InputLabel id="demo-multiple-name-label">Name</InputLabel>
        <Select
          multiple
          value={selected}
          onChange={handleChange}
          renderValue={(e) => { 
            return ( 
                e.map((f) => { 
                    return <Chip label={f} onDelete={() => handleDelete(f)} />
                })
            )

          }}
        >
          {options.map((n) => (
            <MenuItem key={n.id} value={n.label} >
              {n.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default TemplateSelectMulti;
