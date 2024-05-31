import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getTraffic } from '../../actions/trafficGet';
import TrafficMap from './TrafficMap';
import HeatMap from './HeatMap';
import TemplateSelect from '../utils/TemplateSelect';
import TemplateBadge from '../utils/TemplateBadge';
import TemplateSelectMulti from '../utils/TemplateSelectMulti';
import TemplateTextField from '../utils/TemplateTextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Navbar from '../../components/Navbar';

class Map extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "traffic",
            dateSelected:null,
            categories:null,
            zipSelected:null
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.onDateChange= this.onDateChange.bind(this);
        this.onZipChange= this.onZipChange.bind(this);
        this.onCategoryChange = this.onCategoryChange.bind(this);
    } 

    componentWillReceiveProps(p) { 
        var changed = false;
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.dateSelected === null) { 
            this.state.dateSelected = p.trafficData.data.config.avail[0].day
            changed = true;
            this.setState(this.state);
        } 
        /*if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.zipSelected === null) { 
            this.state.zipSelected = p.trafficData.data.config.locations[0].zipcode
            this.setState(this.state);
            changed = true;
        } */
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.categories === null) { 
            var c = 0;
            this.state.categories = [];
            for (c = 0; c < p.trafficData.data.config.categories.length; c++) { 
                if (p.trafficData.data.config.categories[c].name === 'Accident') { continue; }
                if (p.trafficData.data.config.categories[c].name === 'Potential Providers') { continue; }
                this.state.categories.push(p.trafficData.data.config.categories[c]);
            } 
            this.setState(this.state);
            changed = true;
        } 
        if (changed) { 
            var t = [];
            var c = 0;
            for (c = 0; c < this.state.categories.length;c++) { 
                t.push(this.state.categories[c].id);
            } 
            this.props.dispatch(
                getTraffic(
                    {
                        date:this.state.dateSelected,
                        categories:t,
                        zipcode:this.state.zipSelected
                    }
                )
            )
        } 
    }

    componentDidMount() {
        this.props.dispatch(getTraffic({}));
    }

    onCategoryChange(e,t) { 
        this.state.categories = e;
        if (this.state.categories.length < 1) { return; }
        var d = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length;c++) { 
            if (this.state.categories[c].id) { 
                d.push(this.state.categories[c].id);
            } else { 
                d.push(this.state.categories[c].value);
            } 
        } 
        this.setState(this.state);
        this.props.dispatch(getTraffic({categories:d,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
    } 

    onDateChange(e) { 
        var t = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length;c++) { 
            t.push(this.state.categories[c].id);
        } 
        this.state.dateSelected = e.label
        this.setState(this.state);
        this.props.dispatch(getTraffic({categories:t,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
    } 

    onZipChange(e) { 
        var t = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length;c++) { 
            t.push(this.state.categories[c].id);
        } 
        if (e.target.value) { 
            this.state.zipSelected = e.target.value;
            if (e.target.value.length === 5) { 
                this.props.dispatch(getTraffic({categories:t,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
            }
            this.setState(this.state);
        } else { 
            this.state.zipSelected = e.label
            this.setState(this.state);
            this.props.dispatch(getTraffic({categories:t,date:this.state.dateSelected,zipcode:this.state.zipSelected}))
        } 
    } 

    toggleTab(e,t) { 
        this.state.activeTab = t;
        this.setState(this.state);
    } 

    render() {
        return (
        <>
            {(this.props.trafficData && this.props.trafficData.isReceiving) && (
                <AppSpinner/>
            )}
            <Navbar/>
            <div style={{marginLeft:20,marginTop:20,zIndex:512}}>
                <Grid container xs="12">
                    <Grid item xs="2" style={{zIndex:9995}}>
                      {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                        this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                          <TemplateSelect
                              onChange={this.onDateChange}
                              label='Day'
                              value={{
                                label:this.state.dateSelected
                              }}
                              options={this.props.trafficData.data.config.avail.map((e) => { 
                                return (
                                    { 
                                    label: e.day,
                                    value: e.day
                                    }
                                )
                              })}
                            />
                        )}
                    </Grid>                
                    <Grid item xs="1" style={{zIndex:9995}}>
                      {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                        this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                          <TemplateTextField style={{marginLeft:10}} type="text" id="normal-field" label="Zipcode"
                            onChange={this.onZipChange} placeholder="" value={this.state.zipSelected}/>
                        )}
                    </Grid>                
                    <Grid item xs="8" style={{zIndex:9995}}>
                      {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                        this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                          <TemplateSelectMulti
                              onChange={this.onCategoryChange}
                              label='Category'
                              value={this.state.categories.map((g) => { 
                                return (
                                    {
                                    label:g.label ? g.label : g.name,
                                    id:g.id
                                    }
                                )
                              })}
                              options={this.props.trafficData.data.config.categories.map((e) => { 
                                return (
                                    { 
                                    label: e.name,
                                    value: e.id
                                    }
                                )
                              })}
                            />
                        )}
                    </Grid>                
                </Grid>
            </div>
            <Grid container xs="12" style={{marginLeft:20,marginTop:20}}>
                <Grid item xs="12">
                    <Box sx={{width:'100%'}}>
                        {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.center) && (
                        <>
                        <Tabs value={this.state.activeTab} onChange={this.toggleTab}>
                            <Tab value='traffic' label='Traffic'/>
                            <Tab value='heatmap' label='HeatMap'/>
                        </Tabs>
                        {(this.state.activeTab === 'traffic') && ( 
                            <TrafficMap data={this.props.trafficData} centerPoint={this.props.trafficData.data.center}/>
                        )}
                        {(this.state.activeTab === 'heatmap') && ( 
                            <HeatMap data={this.props.trafficData} centerPoint={this.props.trafficData.data.center}/>
                        )}
                        </>
                        )}
                    </Box>
                </Grid>                
            </Grid>
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

export default connect(mapStateToProps)(Map);
