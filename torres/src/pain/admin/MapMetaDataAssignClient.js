import React, { Component } from 'react';
import { Grid, Box, Typography, Avatar, Badge } from '@mui/material';
import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { toast } from 'react-toastify';
import LaunchIcon from '@mui/icons-material/Launch'
import translate from '../utils/translate';
import { Rating } from '@mui/material';
import formatPhoneNumber from '../utils/formatPhone';
import MapMetaDataPreferred from './MapMetaDataPreferred';
import MapMetaDataAccident from './MapMetaDataAccident';
import MapMetaDataNoResult from './MapMetaDataNoResult';
import { searchRegisterAdmin } from '../../actions/searchRegisterAdmin';
import TemplateButton from '../utils/TemplateButton';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateTextFieldPhone from '../utils/TemplateTextFieldPhone';
import "react-datetime/css/react-datetime.css";
import Datetime from 'react-datetime';
 

class MapMetaDataAssignClient extends Component {

    componentDidMount() {
    }

    state = { 
        error_message: '',
        formDisabled: '',
        name: '',
        email: '',
        phone: '',
        attny: '',
        doa: '',
    } 

    save = () => { 
        var tosave = { 
            value: { 
                name:this.state.name, 
                email:this.state.email, 
                phone:this.state.phone, 
                attny:this.state.attny, 
                doa:this.state.doa 
            },
            office_id: this.props.selected.id /* NOTE: Send in the office_addresses id, not the office id */
        }
        this.register(tosave)
    } 
    disableForm = () => { 
        if (
            this.state.name.length < 1 || 
            this.state.email.length < 1 || 
            this.state.phone.length < 1 || 
            this.state.attny.length < 1 || 
            this.state.doa.length < 1 
        ) { return true; } 
        return false;
    } 
    reset = () => { 
        this.setState({
            error_message: null,
            name: '',
            email: '',
            phone: '',
            attny: '',
            doa: '',
        })
    } 
    register = (e) => {
        const params = { ...e };
        this.props.dispatch(searchRegisterAdmin(params, (err, args) => {
            if (err && err.message) {
                args.state.error_message = err.message;
                args.setState(args);
                return;
            }
            toast.success('Successfully saved user to office.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            args.reset();
        },this));
    };

    onNameChange = (e) => { 
        this.state.name = e.target.value
        this.setState(this.state);
    } 
    onEmailChange = (e) => { 
        this.state.email = e.target.value
        this.setState(this.state);
    } 
    onPhoneChange = (e) => { 
        this.state.phone = e.target.value
        this.setState(this.state);
    } 
    onAttnyChange = (e) => { 
        this.state.attny = e.target.value
        this.setState(this.state);
    } 
    onDOAChange = (e) => { 
        this.state.doa = e
        this.setState(this.state);
    } 
    render() { 
        return (
            <Box
              sx={{
                backgroundColor: 'white',
                boxShadow: 4,
                borderRadius: 1,
              }}
            >
              {this.state.selected === null ? (
                <div style={{height:200,display:"flex",alignContent:"center",justifyContent:"center"}}>
                <Typography variant="h6" fontWeight="500">Select an item to see important details</Typography>
                </div>
                ) : (
                <>
                  <Grid container spacing={2} justifyContent="space-between">
                    <Grid item xs={12} sm={12}>
                      <Box px={2} style={{marginBottom:20}}>
                      <>
                        <Grid container xs={12}>
                            <Grid item xs={12}>
                                <div style={{display:"flex",justifyContent:"center"}}>
                                </div>
                            </Grid>
                        </Grid>
                        {this.state.error_message && (
                            <Grid container sx={{ mt: 2 }}>
                                <Grid item xs={12}>
                                    <Typography color="error">{this.state.error_message}</Typography>
                                </Grid>
                            </Grid>
                        )}
                        <Grid container xs={12}>
                            <Grid item xs={12} style={{marginLeft:7}}>
                                <Datetime inputProps = {{placeholder:'DOA'}} timeFormat={false} 
                                    onChange={this.onDOAChange} value={this.state.doa} />
                            </Grid>
                        </Grid>
                        <Grid container xs={12}>
                            <Grid item xs={12}>
                                <TemplateTextField label="Name" onChange={this.onNameChange} value={this.state.name}/> 
                            </Grid>
                        </Grid>
                        <Grid container xs={12}>
                            <Grid item xs={12}>
                                <TemplateTextField label="Email" onChange={this.onEmailChange} value={this.state.email}/> 
                            </Grid>
                        </Grid>
                        <Grid container xs={12}>
                            <Grid item xs={12}>
                                <TemplateTextFieldPhone onChange={this.onPhoneChange} label="Phone" value={this.state.phone}/> 
                            </Grid>
                        </Grid>
                        <Grid container xs={12}>
                            <Grid item xs={12}>
                                <TemplateTextField onChange={this.onAttnyChange} label="Attorney" value={this.state.attny}/> 
                            </Grid>
                        </Grid>
                        <Grid container xs={12} style={{marginTop:20}}>
                            <Grid item xs={12}>
                                <div style={{display:"flex",justifyContent:"center"}}>
                                <div style={{display:"flex",justifyContent:"space-around"}}>
                                    {/*<TemplateButton disabled={formDisabled} label="Send to Network"/>*/}
                                    <TemplateButton variant="contained" 
                                        disabled={this.disableForm()} label="Send To Provider" onClick={this.save}/>
                                </div>
                                </div>
                            </Grid>
                        </Grid>
                      </>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
        );
    }
};

const mapStateToProps = (store) => ({
    searchRegisterAdmin: store.searchRegisterAdmin,
});

export default connect(mapStateToProps)(MapMetaDataAssignClient);

