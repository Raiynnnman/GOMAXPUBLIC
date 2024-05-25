import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import cx from 'classnames';
import classnames from 'classnames';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getLegalDashboard } from '../../actions/legalDashboard';
import TrendHeroWithStats from './components/TrendHeroWithStats';
import MainChart from './components/charts/MainChart';

class LegalDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getLegalDashboard())
    }

    render() {
        return (
        <>
            {(this.props.legalDashboard && this.props.legalDashboard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.legalDashboard && this.props.legalDashboard.data && this.props.legalDashboard.data.revenue_month) && (
            <>
            <Grid md="12">
                <>
                <Grid item  md="3">
                    <TrendHeroWithStats data={this.props.legalDashboard.data.revenue_month}
                        title="Revenue (month)" num1isdollar={true} num2title="Consults" num2isdollar={false} num3title="Appointments" num3ispercent={false}
                        num4title="Payouts"/>
                </Grid>
                </>
            </Grid>
            <Grid md="12">
            </Grid>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        legalDashboard: store.legalDashboard
    }
}

export default connect(mapStateToProps)(LegalDashboard);
