import React, { Component } from 'react';
import { push } from 'connected-react-router';
import moment from 'moment';
import { connect } from 'react-redux';
import cx from 'classnames';
import classnames from 'classnames';
import Grid from '@mui/material/Grid';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getUserDashboard} from '../../actions/userDashboard';
import AliceCarousel from 'react-alice-carousel';

class UserDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            mylocation:null,
            geo: false,
            sent: false
        }
        this.getWithoutPermission = this.getWithoutPermission.bind(this);
        this.setLocation = this.setLocation.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
        var params = { future: true }
        this.props.dispatch(getUserDashboard(params));
    } 

    componentDidMount() {
        if ("geolocation" in navigator) {
            this.state.geo = true
            this.setState(this.state);
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false
              this.setState(this.state);
              var params = {future:true,location:{lat:position.coords.latitude,lon:position.coords.longitude }}
              this.props.dispatch(getUserDashboard(params));
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
            this.props.dispatch(getUserDashboard({}))
        }
    }

    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }


    render() {
        const responsive = {
            0: { 
                items: 1
            },
            568: { 
                items: 1
            },
            1024: {
                items: 2, 
                itemsFit: 'contain'
            },
        };
        return (
        <>
            {(this.props.userDashboard && this.props.userDashboard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            <Grid container xs="12">
                <h3>User Dashboard Here</h3>
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        userDashboard: store.userDashboard
    }
}

export default connect(mapStateToProps)(UserDashboard);
