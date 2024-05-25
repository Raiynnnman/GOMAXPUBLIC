import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import cx from 'classnames';
import classnames from 'classnames';
import TrendHeroWithStats from './components/TrendHeroWithStats';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {getProviderDashboard} from '../../actions/providerDashboard';

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
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.providerDashboard && this.props.providerDashboard.data && 
              this.props.providerDashboard.data.customers) && (
                <Grid container xs="12">
                    <Grid item xs="3">
                        <TrendHeroWithStats data={this.props.providerDashboard.data.customers}
                            title="Clients Gained" num2title="Month" num3title="Year" 
                            num4title="Converted"/>
                    </Grid>
                </Grid>
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
