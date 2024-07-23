import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import moment from 'moment';
import DeleteIcon from '@mui/icons-material/Delete';
import formatPhoneNumber from '../utils/formatPhone';
import { Grid, Typography, Paper, Box, TextField, Divider, Button } from '@mui/material';
import TemplateTextField from '../utils/TemplateTextField';
import formatPhoneNUmber from '../utils/formatPhone';

const inputStyle = {
    input: {
        '&::placeholder': {
          color:'red',
          fontStyle: 'italic',
        },
      },
};

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

const cardStyle = {
    height: '100%',
    marginBottom:12,
    borderRadius:5,
    backgroundColor:"black",
    color:"lightgreen",
    border:"1px solid white",
    '&:hover': {
        backgroundColor: 'black',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    boxSizing: 'border-box'
};

class UserCard extends Component {
    state = {
        selected: null,
        edit:false
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.selected === null && nextProps.provider && nextProps.data.about) {
            this.setState({ selected: nextProps.provider });
        }
        if (this.props.edit && this.state.selected === null) {
            this.setState({ selected: this.props.provider });
        }
    }

    componentDidMount() {
    }

    cancel = () => {
        this.setState({selected:null,edit:false})
        this.props.onCancel();
    }

    render() {
        return (
            <>
            <div style={{backgroundColor:"black",color:"lightgreen"}}>
                {this.props.data && (
                    <Box sx={{ mt: 0, backgroundColor:"black",color:"lightgreen"}}>
                        <Paper elevation={3} sx={cardStyle}>
                            <Box>
                                <Grid container xs={12}>
                                    <Grid item xs={5.5}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography >Name:<br/>{this.props.data.contact.first_name + " " + this.props.data.contact.last_name}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={1} style={{marginTop:10}}>
                                            <Grid item xs={12}>
                                                <Typography >DOB:<br/>{this.props.data.contact.dob}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={1} style={{marginTop:10}}>
                                            <Grid item xs={12}>
                                                <Typography >Phone:<br/> {formatPhoneNumber(this.props.data.contact.phone)}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={1} style={{marginTop:10}}>
                                            <Grid item xs={12}>
                                                <Typography >Email:<br/>{this.props.data.contact.email}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>{formatPhoneNumber(this.props.data.phone)}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2} style={{marginTop:0}}>
                                            <Grid item xs={12}>
                                                <a style={{color:'lightgreen'}} href="#">Facebook:<br/>{this.props.data.contact.facebook}</a>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2} style={{marginTop:10}}>
                                            <Grid item xs={12}>
                                                <a style={{color:'lightgreen'}} href="#">Instagram:<br/>{this.props.data.contact.instagram}</a>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2} style={{marginTop:10}}>
                                            <Grid item xs={12}> 
                                                <a style={{color:'lightgreen'}} href="#">Twitter:<br/>{this.props.data.contact.twitter}</a>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={.5} style={{borderLeft:"1px solid white"}}></Grid>
                                    <Grid item xs={6} style={{marginLeft:0}}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography>DOI:<br/>{
                                                    moment(
                                                        this.props.data.contact.traf_start_time
                                                    ).utcOffset(
                                                        this.props.data.tz_hours
                                                    ).format("LLL") + 
                                                    " (" + this.props.data.tz_short + ")"
                                                    }</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>First Contact:<br/>{this.props.data.contact.contacted_timer + "m"}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>Status:<br/>{this.props.data.contact.status}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>Make:<br/>{
                                                    this.props.data.contact.car_year + " " + 
                                                    this.props.data.contact.car_make + " " + this.props.data.contact.car_model
                                                    }</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>Color:<br/>{
                                                    this.props.data.contact.car_color
                                                    }</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>Intersection:<br/>{
                                                    this.props.data.traf_from
                                                    }</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>lat, lng:<br/>{
                                                    this.props.data.lat + ", " + this.props.data.lng
                                                    }</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Button variant="contained" sx={buttonStyle} onClick={this.cancel}>
                                    Done
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </div>
            </>
        );
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.auth.currentUser,
});

export default connect(mapStateToProps)(UserCard);
