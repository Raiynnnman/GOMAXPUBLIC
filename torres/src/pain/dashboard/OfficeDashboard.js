import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, Link } from '@mui/material';
import ActivityCard from './components/cards/ActivityCard';
import TeamCard from './components/cards/TeamCard';
import locationpin from '../../assets/images/app/location-pin.png';
import HelpSection from '../office/HelpSection';

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

 

const paperStyle = {
  padding: 6,
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  background: 'white',
  width:'100%'
};

 

const imageStyle = {
  width: '64px',
  height: '64px',
  objectFit: 'contain',
  marginBottom: '12px',
}

const buttonStyle = {
  backgroundColor: '#fa6a0a',
  color: 'white',
  '&:hover': {
    backgroundColor: '#e55d00',
  },
  borderRadius: '10px',
  padding: '8px 16px',
  width: '100%',
  textTransform: 'none',
  marginTop: '12px'
};
 

class OfficeDashboard extends Component {
  static propTypes = {
    state: PropTypes.object.isRequired,
    notifications: PropTypes.arrayOf(
      PropTypes.shape({
        acknowledged: PropTypes.number.isRequired,
        notifiable_type: PropTypes.string.isRequired,
        notification_count: PropTypes.number.isRequired,
        office_notifications_category_id: PropTypes.number.isRequired,
      })
    ).isRequired,
  };

  render() {
    const { state, notifications,name } = this.props;

    const titleMapping = {
      client: 'Client Notifications',
      new_event: 'Event Notifications',
      new_client: 'New Clients',
      message: 'New Messages'
    };

  function onPress(){
   window.open('/app/main/office/locations')
   }

    return (
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          padding: { xs: 2, md: 4 },
          paddingTop: { xs: 4, md: 8 },
          background: '#fffcfc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Welcome, {name}
        </Typography>
        <Typography sx={{mb:1}} variant="h6" color="InfoText" gutterBottom>
         Welcome to your Dashboard, Get an overview of your account and more!
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TeamCard
              title="Set Locations"
              imageSrc={locationpin}
              imageStyle={imageStyle}
              buttonLabel="Set Locations"
              buttonStyle={buttonStyle}
              onPress={onPress}
            />
          </Grid>
     
        </Grid>
        <Box sx={{ marginTop: 6, maxWidth: '1500px', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography variant="h4">Notifications</Typography>
            <Link href="#" underline="none" sx={{ color: '#FF5722' }}>View Analytics &rarr;</Link>
          </Box>
          <Grid container spacing={2}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={hoverEffect}>
                    <ActivityCard 
                      title={titleMapping[notification.notifiable_type]} 
                      value={notification.notification_count} 
                      change={notification.acknowledged ? 'Read' : 'unread'} 
                    />
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">No notifications available.</Typography>
              </Grid>
            )}
              {/*PM: Disable for now since it goes nowhere */}
              {/*<HelpSection/>*/}
          </Grid>
         </Box>
      </Box>
    );
  }
}

export default OfficeDashboard;
