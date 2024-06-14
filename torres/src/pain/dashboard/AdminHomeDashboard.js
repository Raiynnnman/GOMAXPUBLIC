import React, { Component } from 'react';
import { Box, Typography, Grid, Paper, Link } from '@mui/material';
import TeamCard from './components/cards/TeamCard';
import ActivityCard from './components/cards/ActivityCard';

const hoverEffect = {
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
  },
};

const paperStyle = {
  padding: 4,
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  background: 'linear-gradient(to bottom right, #FFFFFF, #FFE4B5)',
};

class AdminHomeDashboard extends Component {
  render() {
    return (
      <Box sx={{ padding: 4 , background:'#fffcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Dashboard
          <Typography variant="caption" color="primary" sx={{ marginLeft: 1 }}>NEW</Typography>
        </Typography>
        <Typography variant="h5" gutterBottom>
          Get an overview of your account and more!
        </Typography>
        <Grid container spacing={4} sx={{ maxWidth: '1200px', marginTop: 4 }}>
          <Grid item xs={12} sm={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box sx={hoverEffect}>
                  <TeamCard title="Everyone has accepted their Calendly invite and set up their account!" />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={hoverEffect}>
                  <TeamCard title="Everyone has at least one calendar connected!" />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={hoverEffect}>
                  <TeamCard title="Everyone has video conferencing connected!" />
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ marginTop: 2 }}>
              <Link href="#" underline="none" sx={{ color: '#FF5722' }}>View Team &rarr;</Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ ...paperStyle, ...hoverEffect }}>
              <Typography variant="h6">Get answers to your questions</Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                Find information about admin-specific issues such as managing your organization, integrations, and more.
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <Link href="#" underline="none" sx={{ color: '#FF5722' }}>PoundPain support &rarr;</Link>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 6, maxWidth: '1200px', width: '100%' }}>
          <Typography variant="h5" sx={{ marginBottom: 4 }}>Activity Last Week</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Box sx={hoverEffect}>
                <ActivityCard title="Created events" value="2" change="-66.7%" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={hoverEffect}>
                <ActivityCard title="Completed events" value="4" change="-55.6%" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={hoverEffect}>
                <ActivityCard title="Canceled events" value="0" change="0%" />
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: 2 }}>
            <Link href="#" underline="none" sx={{ color: '#FF5722' }}>View Analytics &rarr;</Link>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default AdminHomeDashboard;
