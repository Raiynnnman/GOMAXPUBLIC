import React, { Component } from 'react';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import { connect } from 'react-redux';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
// import image1 from "../../assets/images/app/pic1.png"

class PhysicianCard extends Component {
    scheduleAppt = () => {
        this.props.onScheduleAppt(this.props.provider);
    };

    renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarOutlineRoundedIcon key={i} style={{ color: i <= rating ? 'gold' : 'lightgrey' }} />
            );
        }
        return stars;
    };

    render() {
        const { provider, admin } = this.props;
        return (
            <Card
                sx={{
                    maxWidth: 400,
                    m: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: 'transform 0.3s, background-color 0.3s',
                    ':hover': {
                        transform: 'translateY(-10px)',
                        backgroundColor: '#FFA500',
                        color: 'white',
                    },
                }}
            >
                <CardMedia
                    component="img"
                    height="180"
                    image={provider.headshot || "/headshot.png"}
                    alt="Provider headshot"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {provider.office_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {provider.profile.title ? `${provider.profile.title} ` : ''}{provider.profile.first_name} {provider.profile.last_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {this.renderStars(provider.rating)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {provider.rating.toFixed(1)}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {provider.miles.toFixed(2)} miles
                    </Typography>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#FFA500',
                                ':hover': { backgroundColor: '#FF8C00' }
                            }}
                            onClick={this.scheduleAppt}
                        >
                            Contact
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.auth.currentUser
});

export default connect(mapStateToProps)(PhysicianCard);
