import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
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
import { getTrafficData } from '../../actions/onlineDemoTraffic';
import TrafficMap from './TrafficMap';

const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
            nextReload:null,
            nextReloadTimer:null,
            zipSelected: null,
            delay:360000, // 6m
            address: '', // New state for address
            center: null, // New state for map center
            recentlyViewed: [] 
        }
        this.reload = this.reload.bind(this);
        this.setNextLoad = this.setNextLoad.bind(this);
    }

    componentWillReceiveProps(p) {
    }

    componentDidMount() {
        this.reload();
    }

    setNextLoad() { 
        setTimeout((e) => { e.setNextLoad() }, 60000, this)
        this.state.nextReloadTimer = moment(this.state.nextReload).fromNow()
        this.setState(this.state);
    }

    reload() { 
        if (this.props.anonymous) { 
            this.props.dispatch(
                getTrafficData(
                    {all_today:true,blur:true,timezone:timeZoneIANA,nationwide:true,categories:[2],limit:50,offset:0},
                    function(e,t) { 
                        var c = new moment().add("ms",t.state.delay);
                        t.state.nextReload = moment(c)
                        t.setState(t.state);
                        t.setNextLoad(e);
                    } 
            ,this));
        } else { 
            this.props.dispatch(
                getTraffic(
                    {blur:true,all_today:true,timezone:timeZoneIANA,nationwide:true,categories:[2],limit:50,offset:0},
                    function(e,t) { 
                        var c = new moment().add("ms",t.state.delay);
                        t.state.nextReload = moment(c)
                        t.setState(t.state);
                        t.setNextLoad(e);
                    } 
            ,this));
        } 
        setTimeout((e) => { e.reload() }, this.state.delay, this)
    } 

    render() {
        return (
            <>
            <div style={{backgroundColor:"black"}}>
                {(this.props.trafficData && this.props.trafficData.isReceiving) && (
                    <AppSpinner />
                )}
                {(!this.props.hideNav) && (
                    <Navbar />
                )}
                <Box style={{marginLeft:20,marginRight:20}}>
                <Grid container spacing={2} style={{ marginLeft: {xs:4} }}>
                    <Grid item xs={12}>
                        <Box sx={{  }}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.center) && (
                                <>
                                    <TrafficMap targeted={this.state.officeTarget} nextReload={this.state.nextReload}
                                        nextReloadTimer={this.state.nextReloadTimer}
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
        trafficData: store.trafficData.data.data ?  store.trafficData : store.onlineDemoTraffic
    }
}

export default connect(mapStateToProps)(InvestorMap);
