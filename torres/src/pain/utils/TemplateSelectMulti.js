import React, { useState, Component, useEffect } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import { Paper } from '@mui/material';
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
  sel = [...new Set(sel)];


  const [selectAll, setSelectAll] = React.useState(value.length === options.length);
  const [selected, setSelected] = React.useState(sel);
  const [open,setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChange = (e,t) => {
    var q = e.target.value.filter((f) => f === 'SelectAll');
    var v = e.target.value.filter((f) => f !== 'SelectAll');
    if (q.length > 0 && v.length !== options.length) { 
        v = [];
        var c = 0;
        for (c = 0; c < options.length; c++) { 
            v.push(options[c].label);
        } 
        setSelectAll(true);
    } 
    else if (q.length > 0 && v.length === options.length) { 
        v = []
        setSelectAll(false);
    } 
    v = [...new Set(v)];
    setSelected(v);
    var c = 0;
    var n = []
    for (c = 0; c < v.length; c++) { 
        var b = v[c];
        var r = options.findIndex((f) => f.label === b);
        n.push(options[r]);
    } 
    onChange(n);
  };

  return (
    <div>
        <Paper>
          <FormControl sx={{ m: 1, width: "100%" }} size="small">
            <InputLabel key={label}>{label}</InputLabel>
            <Select
              multiple
              style={style}
              value={selected}
              onOpen={handleOpen}
              onClose={handleClose}
              onChange={handleChange}
              renderValue={(e) => { 
                return ( 
                    e.map((f) => { 
                        return <Chip key={f} size="small"
                            label={f} />
                    })
                )

              }}
            >
              <MenuItem key={0} value='SelectAll' style={{borderBottom:"1px solid black"}}>
                  <Checkbox checked={selectAll}/> 
                  <ListItemText primary="Select All"/>
              </MenuItem>
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
        </Paper>
    </div>
  );
}

export default TemplateSelectMulti;
