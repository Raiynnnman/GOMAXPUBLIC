import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';


function TemplateButton({label,onClick,disabled,style}) {

    const doClick = function(e) { 
        console.log("clickme",e)
        onClick(e);
    } 

    return (
        <Button style={style} className="button-default button-olive" variant="contained" 
            onClick={doClick} disabled={disabled}>{label}</Button>
    )
}

export default TemplateButton;
