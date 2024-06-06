import React, { useState, Component, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function TemplateCheckbox({label,onClick,checked,disabled,style}) {

    return (
        <FormGroup>
              <FormControlLabel style={style} disabled={disabled} onClick={onClick}
                control={<Checkbox defaultChecked={checked} />} label={label} />
        </FormGroup>
    )
}

export default TemplateCheckbox;
