import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import AnalyticEcommerce from '../dashboard/components/cards/AnalyticCard';
import PainTable from '../utils/PainTable';
import MainCard from '../dashboard/components/cards/MainCard';
import MonthlyBarChart from '../dashboard/components/charts/MonthlyBarChart';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

class DealTracker extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.showMore = this.showMore.bind(this);
        this.showLess = this.showLess.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    showMore(r) { 
        r.showMore = true
        this.setState(this.state);
    } 

    showLess(r) { 
        r.showMore = false
        this.setState(this.state);
    } 


    getColor(e) { 
        console.log("gc",e)
        return "white";
    } 


    render() {
        console.log("p1",this.props);
        const columns = [
            { dataField: 'id', text: '', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'name', text: 'Name', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'setter_name', text: 'Set By', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'source_name', text: 'Source', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'close_requirements', text: 'Close Req', 
                formatter:(cellContent,row) => (
                    <div>
                        {(row.close_requirements.length > 50 && row.showMore) && (
                                <div>
                                    {row.close_requirements}
                                    <a style={{color:'blue',cursor:"pointer"}} onClick={() => this.showLess(row)}>Less</a> 
                                </div>
                        )}
                        {(row.close_requirements.length > 50 && !row.showMore) && (
                                <div>
                                    {row.close_requirements.substr(0,50) + "..."}
                                    <a style={{color:'blue',cursor:"pointer"}} onClick={() => this.showMore(row)}>More</a> 
                                </div>
                        )}
                        {(row.close_requirements.length < 50) && (
                                <div>{row.close_requirements}</div>
                        )}
                    </div>
                )
            },
            { dataField: 'set_date', text: 'Date Set', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'present_date', text: 'Present Date', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'estimated_close_date', text: 'ECD', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'presented_status_name', text: 'Presented', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
            { dataField: 'office_alternate_status_name', text: 'Status', 
                onClick: (content,row) => (
                    this.props.onEdit(content)
                ),
            },
        ]
        return (
        <>
        <Box style={{margin:20}}>
            {(this.props.data && this.props.data.length > 0) && (
            <>
            <Grid container xs="12">
                <Grid item xs="2">
                    <AnalyticEcommerce 
                        title="Appointments Today"
                        count={`${this.props.dashboard.appointments.num1 || 0}`}  
                        percentage={((this.props.dashboard.appointments.num2 || 0) * 100).toFixed(2)}  
                    />
                </Grid>
                <Grid item xs="3" style={{marginLeft:10}}>
                    <MainCard sx={{height:220}}  title="Appointments Coming" content={false}>
                        <MonthlyBarChart height={200} data={this.props.dashboard.future_appointments} />
                    </MainCard>
                </Grid>                
                <Grid item xs="3" style={{marginLeft:10}}>
                    <MainCard sx={{height:220}} title="Paid Value" content={false}>
                        <MonthlyBarChart height={200} data={this.props.dashboard.week_sales} />
                    </MainCard>
                </Grid>                
                <Grid item xs="3" style={{marginLeft:10}}>
                    <MainCard sx={{height:220}}  title="Pipeline Value" content={false}>
                        <MonthlyBarChart height={200} data={this.props.dashboard.potential_sales} />
                    </MainCard>
                </Grid>                
            </Grid>
            <Grid container xs="12" style={{marginTop:20}}>
                <Grid item xs="12">
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <PainTable
                                keyField='id' 
                                selectAll={false}
                                data={this.props.data} 
                                total={this.props.data.length}
                                page={0}
                                pageSize={this.props.data.length}
                                columns={columns}/>
                    </Paper>
                </Grid>                
            </Grid>
            </>
            )}
        </Box>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(DealTracker);
