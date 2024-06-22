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
import PhysicianCard from '../clients/PhysicianCard';

class UserDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.viewAppt = this.viewAppt.bind(this);
        this.chatAppt = this.chatAppt.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    viewAppt(e) { 
        window.location = '/app/main/client/appointments/' + e.appt_id
    } 

    chatAppt(e) { 
        console.log(e);
    } 

    componentDidMount() {
        this.props.dispatch(getUserDashboard({}))
    }

    render() {
        return (
        <>
            {(this.props.userDashboard && this.props.userDashboard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            <Grid container xs="12">
            <>
                {(this.props.userDashboard && this.props.userDashboard.data &&
                  this.props.userDashboard.data.appt && this.props.userDashboard.data.appt.length > 0) && ( 
                  <>
                    {this.props.userDashboard.data.appt.map((e) => { 
                        return (
                            <Grid item xs="2">
                                <PhysicianCard provider={e} onViewAppt={this.viewAppt} onChatAppt={this.chatAppt}/>
                            </Grid>
                        )
                    })}   
                  </>
                )}
                {(this.props.userDashboard && this.props.userDashboard.data &&
                  this.props.userDashboard.data.appt && this.props.userDashboard.data.appt.length === 0) && ( 
                <Grid item xs="12">
                    <h3>No appointments scheduled</h3> 
                </Grid>
                )}
            </>
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
