import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ActivityCard = ({ title, value, change }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 4,
        textAlign: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h3" fontWeight="bold" color="#FF5722">{value}</Typography>
      <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
        <Typography variant="body1">{title}</Typography>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
        <Typography variant="body2" color={change.startsWith('-') ? 'error' : 'success'} sx={{ marginLeft: 1 }}>
          {change}
        </Typography>
      </Box>
    </Paper>
  );
}

export default ActivityCard;
