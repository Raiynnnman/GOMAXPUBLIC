import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppSpinner from '../utils/Spinner';
import { getAdminDashboard } from '../../actions/adminDashboard';
import UniqueVisitorCard from './components/cards/UniqueVisitorCard';
import MonthlyBarChart from './components/charts/MonthlyBarChart';
import MainCard from './components/cards/MainCard';
import AnalyticEcommerce from './components/cards/AnalyticCard';
import convertToFormat from '../utils/convertToFormat';
 class AdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.props.dispatch(getAdminDashboard());
    }

    render() {
        const { adminDashboard } = this.props;

        if (adminDashboard && adminDashboard.isReceiving) {
            return <AppSpinner />;
        }

        if (adminDashboard && adminDashboard.data) {
            const { data } = adminDashboard;
            const {
                website_stats = {},
                visits = {},
                lead_status={},
                commissions = {},
                website_performance={},
                revenue_month = {},
                revenue_leads_month = {},
                traffic = {}
            } = data;
 


            return (
                <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                    {/* Row 1 */}
                    <Grid item xs={12} sx={{ mb: 4.25 }}>
                        <Typography variant="h3">Dashboard</Typography>
                    </Grid>
                     <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total Page Views"
                            count={`${website_stats.num1 || 0}`}  
                            percentage={((website_stats.num2 || 0) * 100).toFixed(2)}  
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="In-Network"
                            count={`${lead_status.num2 || 0}`}
                            percentage={((lead_status.num2/lead_status.num1 || 0) * 100).toFixed(2)}  
                            extra={`${visits.num4 || 0}`}  
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total Revenue"
                            count={`${convertToFormat(revenue_month.num1 || 0)}`}  
                            percentage={((revenue_month.num2 || 0) * 100).toFixed(2)}  
                            isLoss={revenue_month.num2 < 0}  
                            color={revenue_month.num2 < 0 ? 'warning' : 'success'}
                            extra={`${revenue_month.num3 || 'N/A'}`}  
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total Commissions"
                            count={`$${commissions.num1 || 0}`}  
                            percentage={((revenue_leads_month.num2 || 0) * 100).toFixed(2)}  
                            isLoss={revenue_leads_month.num2 < 0}  
                            color={revenue_leads_month.num2 < 0 ? 'warning' : 'success'}
                            extra={`$${commissions.num3 || 0}`}  
                        />
                    </Grid>

                    <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

                    {/* Row 2 */}
                    <Grid item xs={12} md={7} lg={8}>
                        {(website_performance && website_performance.labels && website_performance.labels.length > 0) && (
                            <UniqueVisitorCard data={website_performance} />
                        )}
                    </Grid>
                    <Grid item xs={12} md={5} lg={4}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h5">Traffic Accidents Detected by Month</Typography>
                            </Grid>
                            <Grid item />
                        </Grid>
                        <MainCard sx={{ mt: 2 }} content={false}>
                            {(traffic && traffic.length && traffic.length > 0) && (
                                <MonthlyBarChart data={traffic} />
                            )}
                        </MainCard>
                    </Grid>
                </Grid>
            );
        }

        return <AppSpinner />;
        
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        adminDashboard: store.adminDashboard
    };
}

export default connect(mapStateToProps)(AdminDashboard);
