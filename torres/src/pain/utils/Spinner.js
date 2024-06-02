import React, { Component } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';


import './Spinner.scss';

function AppSpinner() {
  return (
    <Box sx={{ position:'absolute',top:25,left:50,display: 'flex' }}>
      <CircularProgress />
    </Box>
  )
}

export default AppSpinner;
