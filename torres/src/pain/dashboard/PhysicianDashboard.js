import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import cx from 'classnames';
import classnames from 'classnames';
import TrendHeroWithStats from './components/TrendHeroWithStats';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getProviderDashboard} from '../../actions/providerDashboard';
import OfficeDashboard from './OfficeDashboard';
import { getContext } from '../../actions/context';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getProviderDashboard())
    }

    render() {
        console.log("p",this.props);
        const OfficeDashboardData = this.props.providerDashboard.data.notifications
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.providerDashboard && this.props.providerDashboard.data && 
              this.props.providerDashboard.data.customers) && (
                <OfficeDashboard 
                name={this.props.currentUser.contextValue ? this.props.currentUser.contextValue.name : this.props.currentUser.first_name}
                state={this.props.providerDashboard.data.customers} 
                notifications={OfficeDashboardData} 
            />            
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        providerDashboard: store.providerDashboard
    }
}

export default connect(mapStateToProps)(Template);
