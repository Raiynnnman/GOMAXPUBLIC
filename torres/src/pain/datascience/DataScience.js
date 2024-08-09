import React, { Component } from 'react';
import { connect } from 'react-redux';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';
import { getDataScienceJobs } from '../../actions/dataScienceJobs';

class Template extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "jobs",
        }
        this.toggleTab = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(getDataScienceJobs({}));
    }

    toggleTab(e, t) {
        this.state.activeTab = t;
        this.setState(this.state);
    }


    render() {
        console.log("p",this.props);
        return (
        <>
        <Navbar/>
        <Box style={{margin:20}}>
            <Tabs value={this.state.activeTab} onChange={this.toggleTab} >
                <Tab value='jobs' label='Jobs' />
                <Tab value='queries' label='Query' />
                <Tab value='dataset' label='Dataset' />
                <Tab value='results' label='Results' />
            </Tabs>
            <Grid container xs="12">
                <Grid item xs="12">
                <>
                    <h1>Datascience!</h1>
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
        dataScienceJobs: store.dataScienceJobs
    }
}

export default connect(mapStateToProps)(Template);
