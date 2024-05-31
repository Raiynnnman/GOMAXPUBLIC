import React, { useState, Component, useEffect } from 'react';
import Chip from '@mui/material/Chip';


function TemplateBadge({label,onClick,disabled,style}) {

    return (
        <Chip style={style} label={label} variant="outlined" 
            disabled={disabled}/>
    )
}

export default TemplateBadge;
