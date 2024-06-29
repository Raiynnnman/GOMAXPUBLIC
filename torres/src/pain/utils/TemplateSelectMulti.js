import React, { useState, Component, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';

import Chip from '@mui/material/Chip';
import ListItemText from '@mui/material/ListItemText';
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
    var upd = [];
    var c = 0;
    for (c = 0; c < t.length; c++) { 
        var g = options.filter((k) => k.label === t[c])
        if (g.length > 0) { upd.push(g[0]); }
    } 
    setSelected(t);
    onChange(upd);
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
      <FormControl sx={{ m: 1, width: "100%" }} size="small">
        <InputLabel key={label}>{label}</InputLabel>
        <Select
          multiple
          value={selected}
          onChange={handleChange}
          renderValue={(e) => { 
            return ( 
                e.map((f) => { 
                    return <Chip key={f} size="small"
                        onMouseDown={(event) => { event.stopPropagation(); }}
                        label={f} onDelete={() => handleDelete(f)} />
                })
            )

          }}
        >
          {options.map((n) => {
            return (
                <MenuItem key={n.label} value={n.label} >
                  <Checkbox checked={sel.indexOf(n.label) > -1}/>
                  <ListItemText primary={n.label}/>
                </MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </div>
  );
}

export default TemplateSelectMulti;
