import React from 'react';
import { Grid, Typography, Paper, Box, Link } from '@mui/material';
const paperStyle = {
  padding: 6,
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  background: 'white',
  width:'100%'
};
const hoverEffect = {
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    borderRadius: '10px',
    color: 'white',
    backgroundColor: '#f7ab35',
  },
};

const HelpSection = () => {
  return (
    <Grid container spacing={2} sx={{ mt: 10 }}>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 2 }} color="textSecondary">
          Help
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper variant="outlined" sx={{ ...paperStyle, ...hoverEffect }}>
          <Typography variant="h5">Get answers to your questions</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Find information about admin-specific issues such as managing your organization, integrations, and more.
          </Typography>
          <Box sx={{ marginTop: 2 }}>
            <Link href="#" underline="none" sx={{ color: '#FF5722' }}>
              PoundPain support &rarr;
            </Link>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper variant="outlined" sx={{ ...paperStyle, ...hoverEffect }}>
          <Typography variant="h5">Get answers to your questions</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Find information about admin-specific issues such as managing your organization, integrations, and more.
          </Typography>
          <Box sx={{ marginTop: 2 }}>
            <Link href="#" underline="none" sx={{ color: '#FF5722' }}>
              PoundPain support &rarr;
            </Link>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HelpSection;
