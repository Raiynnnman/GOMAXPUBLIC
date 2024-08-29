import React, { Component } from 'react';
import { connect } from 'react-redux';
import MainCard from '../dashboard/components/cards/MainCard';
import AnalyticEcommerce from '../dashboard/components/cards/AnalyticCard';
import MonthlyBarChart from '../dashboard/components/charts/MonthlyBarChart';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Clients from './Clients';
import Registrations from './Registrations';

class MyStuff extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            page: 0,
            activeTab:"clients",
            pageSize: 10
        }
        this.toggleTab = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 

    }

    componentDidMount() {

    }

    toggleTab(e,t) { 
        this.state.activeTab = t;
        this.setState(this.state);
    } 

    render() {
        return (
        <>
        <Box style={{marginTop:20}}>
            <Grid container xs="12" style={{margin:0}}>
                <Grid item xs="12">
                    <>
                        {(this.props.registrationsAdminList && this.props.registrationsAdminList.data &&
                          this.props.registrationsAdminList.data.dashboard && this.props.registrationsAdminList.data.dashboard.mine) && (
                        <div style={{}}>
                            <div style={{display:"flex",justifyContent:"space-around"}}>
                                <AnalyticEcommerce 
                                    title="Appointments Today"
                                    count={`${this.props.registrationsAdminList.data.dashboard.mine.appointments.num1 || 0}`}  
                                    percentage={((this.props.registrationsAdminList.data.dashboard.mine.appointments.num2 || 0) * 100).toFixed(2)}  
                                />
                                <MainCard sx={{height:220}}  title="Appointments Coming" content={false}>
                                    <MonthlyBarChart height={200} data={this.props.registrationsAdminList.data.dashboard.mine.future_appointments} />
                                </MainCard>
                                <MainCard sx={{height:220}}  title="Appointments Presented" content={false}>
                                    <MonthlyBarChart height={200} data={this.props.registrationsAdminList.data.dashboard.mine.presented} />
                                </MainCard>
                                <MainCard sx={{height:220}} title="Paid Value" content={false}>
                                    <MonthlyBarChart height={200} data={this.props.registrationsAdminList.data.dashboard.mine.week_sales} />
                                </MainCard>
                                <MainCard sx={{height:220}}  title="Pipeline Value" content={false}>
                                    <MonthlyBarChart height={200} data={this.props.registrationsAdminList.data.dashboard.mine.potential_sales} />
                                </MainCard>
                            </div>
                        </div>
                        )}
                    </>
                </Grid>
            </Grid>
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        registrationsAdminList: store.registrationsAdminList,
        referrerAdminList: store.referrerAdminList,
    }
}

export default connect(mapStateToProps)(MyStuff);
