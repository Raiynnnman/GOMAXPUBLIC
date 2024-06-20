import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import { withScriptjs, withGoogleMap } from "react-google-maps";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../../components/Navbar';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getAppointments }  from '../../actions/appointments';
import DirectionsMap from '../utils/DirectionsMap';
import PhysicianCard from './PhysicianCard';
import googleKey from '../../googleConfig';
import ChatUser from '../chatUser/ChatUser';


class Appointments extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected:null,
            uuid:null
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        const initMap = (e) => { 
            console.log("init",e);
        } 
        if (this.props.match.params && this.props.match.params.id) { 
            this.state.selected = this.props.match.params.id;
            this.setState(this.state);
            this.props.dispatch(getAppointments({uuid:null, id: this.state.selected}));
        } else { 
            this.props.dispatch(getAppointments({}));
        } 
        const loadScript = (src) => new Promise((resolve, reject) => {
              if (document.querySelector(`script[src="${src}"`)) return resolve()
              const script = document.createElement('script')
              script.src = src
              script.onload = () => resolve()
              script.onerror = (err) => reject(err)
              document.body.appendChild(script)
        })
        const src=`https://maps.googleapis.com/maps/api/js?key=${googleKey()}&callback=initMap`;
        loadScript(src);
    } 


    render() {
        const WrappedMap = withGoogleMap(DirectionsMap);
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            <Grid container xs="12">
                {(this.state.selected === null) && (
                    <h1>entries here</h1>
                )}
                {(this.state.selected !== null) && (
                <>
                    {(this.props.appointments && this.props.appointments.data && this.props.appointments.data.location) && (
                    <Grid container xs={12}>
                        <Grid item xs={6}>
                            <Grid container xs={12}>
                                <Grid item xs={12}>
                                    <PhysicianCard provider={this.props.appointments.data.appt[0]}/>
                                </Grid>
                            </Grid>
                            <Grid container xs={12}>
                                <Grid item xs={12}>
                                    <ChatUser appt={this.state.selected}/>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                        <>
                            <Grid container xs={12}>
                                <Grid item xs={12}>
                                    <WrappedMap 
                                      containerElement={<div style={{ height: "80vh" }} />}
                                      mapElement={<div style={{ height: `100%` }} />}
                                      centerPoint={this.props.appointments.data.center} 
                                      formattedOrigin={this.props.appointments.data.location} 
                                      formattedDestination={this.props.appointments.data.destination}/>
                                </Grid>
                            </Grid>
                        </>
                        </Grid>
                    </Grid>
                    )}
                </>
                )}
            </Grid>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        appointments: store.appointments
    }
}

export default connect(mapStateToProps)(Appointments);
