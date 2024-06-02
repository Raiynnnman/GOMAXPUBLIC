import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import classnames from 'classnames';
import Grid from '@mui/material/Grid';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getAdminDashboard } from '../../actions/adminDashboard';
import TrendHeroWithStats from './components/TrendHeroWithStats';
import MainChart from './components/charts/MainChart';

class AdminDashboard extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getAdminDashboard())
    }

    render() {
        return (
        <>
            {(this.props.adminDashboard && this.props.adminDashboard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.adminDashboard && this.props.adminDashboard.data && this.props.adminDashboard.data.visits) && (
            <>
            <Grid container spacing={1}>
                <>
                <Grid item xs={0} md={3}>
                    <TrendHeroWithStats data={this.props.adminDashboard.data.visits}
                        title="Visits Today" num2title="Logins Today" num3title="Conversion" num3ispercent={true}
                        num4title="Appointments"/>
                </Grid>
                <Grid item xs={0} md={3}>
                    <TrendHeroWithStats data={this.props.adminDashboard.data.revenue_month}
                        title="PAIN Revenue this month" num1isdollar={true} 
                        num2title="Paid" num2isdollar={true} num3title="Sent" num3isdollar={true}
                        num4title="Error" num4isdollar={true}/>
                </Grid>
                <Grid item xs={0} md={3}>
                    <TrendHeroWithStats data={this.props.adminDashboard.data.lead_status}
                        title="Network Information" num1isdollar={false} num2title="Preferred" num2isdollar={false} 
                            num3title="In-Network" num3isdollar={false} num4title="Potential"/>
                </Grid>
                <Grid item xs={0} md={3}>
                    <TrendHeroWithStats data={this.props.adminDashboard.data.traffic}
                        title="Traffic Stats" num1isdollar={false} num2title="Today" num2isdollar={false} 
                            num3title="Month" num3isdollar={false} num4title="Year"/>
                </Grid>
                <Grid item xs={0} md={3}>
                    <TrendHeroWithStats data={this.props.adminDashboard.data.commissions}
                        title="Commissions" 
                            num1isdollar={true} num2title="Paid" num2isdollar={true} 
                            num3title="Sent" num3isdollar={true} num4isdollar={true} 
                            num4title="Void"/>
                </Grid>
                <Grid item xs={0} md={3}>
                    <TrendHeroWithStats data={this.props.adminDashboard.data.website_stats}
                        title="Platform Stats Today" num2pure={true} num3pure={true} num4pure={true}
                            num1isdollar={false} num2title="Avg" num2isdollar={false} 
                            num3title="Max" num3isdollar={false} num4title="Min"/>
                </Grid>
                </>
            </Grid >
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        adminDashboard: store.adminDashboard
    }
}

export default connect(mapStateToProps)(AdminDashboard);
