import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const TeamCard = ({ title  }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 4,
        width:'25vh',
        height:'30vh',
        textAlign: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h3" fontWeight="bold" color="#FF5722"> </Typography>
      <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
        <Typography variant="body1">{title}</Typography>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
      </Box>
    </Paper>
  );
}

export default TeamCard;
