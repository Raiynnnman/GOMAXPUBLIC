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
        console.log(adminDashboard);

        if (adminDashboard && adminDashboard.isReceiving) {
            return <AppSpinner />;
        }

        if (adminDashboard && adminDashboard.data) {
            const { data } = adminDashboard;
            const {
                website_stats = {},
                visits = {},
                revenue_month = {},
                revenue_leads_month = {}
            } = data;

            return (
                <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                    {/* Row 1 */}
                    <Grid item xs={12} sx={{ mb: -2.25 }}>
                        <Typography variant="h5">Dashboard</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total Page Views"
                            count={`${website_stats.num1 || 0}`}  
                            percentage={(website_stats.num2 || 0) * 100}  
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total Visits"
                            count={`${visits.num1 || 0}`}
                            percentage={(visits.num3 || 0) * 100}  
                            extra={`${visits.num4 || 0}`}  
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total PoundPain Revenue"
                            count={`${revenue_month.num1 || 0}`}  
                            percentage={(revenue_month.num2 || 0) * 100}  
                            isLoss={revenue_month.num2 < 0}  
                            color={revenue_month.num2 < 0 ? 'warning' : 'success'}
                            extra={`${revenue_month.num3 || 'N/A'}`}  
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <AnalyticEcommerce 
                            title="Total Sales"
                            count={`$${revenue_leads_month.num1 || 0}`}  
                            percentage={(revenue_leads_month.num2 || 0) * 100}  
                            isLoss={revenue_leads_month.num2 < 0}  
                            color={revenue_leads_month.num2 < 0 ? 'warning' : 'success'}
                            extra={`$${revenue_leads_month.num3 || 0}`}  
                        />
                    </Grid>

                    <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

                    {/* Row 2 */}
                    <Grid item xs={12} md={7} lg={8}>
                        <UniqueVisitorCard data={data.website_stats} />
                    </Grid>
                    <Grid item xs={12} md={5} lg={4}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h5"> User Traffic Overview</Typography>
                            </Grid>
                            <Grid item />
                        </Grid>
                        <MainCard sx={{ mt: 2 }} content={false}>
                            <Box sx={{ p: 3, pb: 0 }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" color="text.secondary">
                                        This Weeks Statistics
                                    </Typography>
                                </Stack>
                            </Box>
                            <MonthlyBarChart data={data.traffic} />
                        </MainCard>
                    </Grid>
                </Grid>
            );
        }

        return null;
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        adminDashboard: store.adminDashboard
    };
}

export default connect(mapStateToProps)(AdminDashboard);
