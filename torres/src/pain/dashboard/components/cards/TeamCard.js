import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';

const TeamCard = ({ title, imageSrc, buttonLabel, buttonStyle, imageStyle }) => {
  return (
    <Paper
      sx={{
        padding: 4,
        width: '50vh',
        height: '35vh',
        textAlign: 'center',
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        transition: 'transform 0.3s, box-shadow 0.3s',
        marginTop:'21px',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          borderRadius: '10px'
        },
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={title}
        sx={{
          ...imageStyle,
          width: '80px',  
          height: '80px',
        }}
      />
      <Typography variant="h6" sx={{ marginTop:4 }}>
        {title}
      </Typography>
      <Button variant="contained" color="primary" sx={buttonStyle}>
        {buttonLabel}
      </Button>
    </Paper>
  );
}

export default TeamCard;
