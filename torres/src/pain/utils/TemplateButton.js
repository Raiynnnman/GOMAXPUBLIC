import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';


function TemplateButton({label,onClick,disabled,style}) {

    const doClick = function(e) { 
        onClick(e);
    } 

    return (
        <Button style={style} variant="contained" 
            onClick={doClick} disabled={disabled}>{label}</Button>
    )
}

export default TemplateButton;
