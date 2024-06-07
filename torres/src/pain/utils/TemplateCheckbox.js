import React, { useState, Component, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function TemplateCheckbox({label,onClick,checked,disabled,style,boxColor,checkColor}) {
    var sx = {}
    if (!boxColor) { 
        sx = {
            color: 'black[800]',
            '&.Mui-checked': {
              color: 'white[600]',
            },
        }
    } else { 
        sx = {
            color: boxColor,
            '&.Mui-checked': {
              color: checkColor,
            },
        }
    } 
    return (
        <FormGroup>
              <FormControlLabel 
             style={style} disabled={disabled} onClick={onClick}
                control={<Checkbox sx={sx} defaultChecked={checked} />} label={label} />
        </FormGroup>
    )
}

export default TemplateCheckbox;
