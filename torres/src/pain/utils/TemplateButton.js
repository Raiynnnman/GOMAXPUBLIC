import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';


function TemplateButton({label,onClick,disabled,style,sx,size}) {

    const doClick = function(e) { 
        onClick(e);
    } 
    return (
        <Button style={style} variant="contained" 
            sx={{ borderRadius: 8, backgroundColor: '#FF5733', color: '#fff', padding: '10px 45px', 
                fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
            onClick={doClick} size={size} disabled={disabled}>{label}</Button>
    )
}

export default TemplateButton;
