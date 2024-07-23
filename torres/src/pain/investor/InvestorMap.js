import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Navbar from '../../components/Navbar';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateSelectSearch from '../utils/TemplateSelectSearch';
import TemplateTextField from '../utils/TemplateTextField';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import AppSpinner from '../utils/Spinner';
import { getTraffic } from '../../actions/trafficGet';
import TrafficMap from './TrafficMap';

class InvestorMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dateSelected: null,
            officeFilter:'',
            officeTarget:[],
            currentTable:[],
            categories: null,
            categoriesFilter:[],
            officeTypeFilter:[],
            office_types: null,
            zipSelected: null,
            delay:180000, // 3m
            address: '', // New state for address
            center: null, // New state for map center
            recentlyViewed: [] 
        }
        this.reload = this.reload.bind(this);
    }

    componentWillReceiveProps(p) {
    }

    componentDidMount() {
        this.reload();
    }

    reload() { 
        this.props.dispatch(
            getTraffic(
                {nationwide:true,categories:[2],limit:50,offset:0},
                function(e,t) { } 
        ),this);
        // setTimeout((e) => { e.reload() }, this.state.delay, this)
    } 

    render() {
        return (
            <>
            <div style={{backgroundColor:"black"}}>
                {(this.props.trafficData && this.props.trafficData.isReceiving) && (
                    <AppSpinner />
                )}
                <Navbar />
                <Box style={{margin:20}}>
                <Grid container spacing={2} style={{ marginLeft: {xs:4}, marginTop: 0 }}>
                    <Grid item xs={12}>
                        <Box sx={{  }}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.center) && (
                                <>
                                    <TrafficMap targeted={this.state.officeTarget} 
                                        data={this.props.trafficData} centerPoint={this.state.center || this.props.trafficData.data.center} />
                                </>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </div>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        trafficData: store.trafficData
    }
}

export default connect(mapStateToProps)(InvestorMap);
