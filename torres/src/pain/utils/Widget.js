import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

function TemplateButton({title,label,onClick,disabled}) {

    return (
    <>
    <Card sx={{ maxWidth: 345 }}>
        <CardHeader>{title}</CardHeader>
    </Card>
    </>
    )
}

export default TemplateButton;
