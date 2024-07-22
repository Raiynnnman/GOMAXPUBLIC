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
    '&:hover': {
        backgroundColor: '#FFFAF2',
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
        console.log("p",this.props);
        return (
            <>
                {this.props.data && (
                    <Box sx={{ mt: 3 }}>
                        <Paper elevation={3} sx={cardStyle}>
                            <Box>
                                <Grid container xs={12}>
                                    <Grid item xs={5.5}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography >Name: {this.props.data.contact.first_name + " " + this.props.data.contact.last_name}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography >DOB: {this.props.data.contact.dob}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography >Phone:{formatPhoneNumber(this.props.data.contact.phone)}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography >Email: {this.props.data.contact.email}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>{formatPhoneNumber(this.props.data.phone)}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <a style={{color:'blue'}} href="#">Facebook: {this.props.data.contact.facebook}</a>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <a style={{color:'blue'}} href="#">Instagram: {this.props.data.contact.instagram}</a>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <a style={{color:'blue'}} href="#">Twitter: {this.props.data.contact.twitter}</a>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={.5} style={{borderLeft:"1px solid black"}}></Grid>
                                    <Grid item xs={6} style={{marginLeft:0}}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography>Incident: {moment(this.props.data.created).fromNow()}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>Contacted: {moment(this.props.data.contact.contacted).fromNow()}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} style={{marginTop:10}}>
                                                <Typography>Status: {this.props.data.contact.status}</Typography>
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
            </>
        );
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.auth.currentUser,
});

export default connect(mapStateToProps)(UserCard);
