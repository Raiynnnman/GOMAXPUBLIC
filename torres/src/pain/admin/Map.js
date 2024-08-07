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
import HeatMap from './HeatMap';
//import WeatherMap from './WeatherMap';
//import WeatherCard from './WeatherCard';
class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "traffic",
            dateSelected: null,
            officeFilter:'',
            officeTarget:[],
            categories: null,
            categoriesFilter:[],
            officeTypeFilter:[],
            office_types: null,
            zipSelected: null,
            address: '', // New state for address
            center: null, // New state for map center
            recentlyViewed: [] 
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onZipChange = this.onZipChange.bind(this);
        this.onCategoryChange = this.onCategoryChange.bind(this);
        this.onOfficeTypeChange = this.onOfficeTypeChange.bind(this);
        this.onOfficeFilterChange = this.onOfficeFilterChange.bind(this);
        this.onAddressChange = this.onAddressChange.bind(this); // New handler
        this.onRouteButtonClick = this.onRouteButtonClick.bind(this); // New handler
    }

    componentWillReceiveProps(p) {
        var changed = false;
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.dateSelected === null) {
            this.state.dateSelected = p.trafficData.data.config.avail[0].day
            changed = true;
            this.setState(this.state);
        }
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.office_types === null) {
            this.state.office_types = [];
            this.state.categoriesFilter = [];
            for (c = 0; c < p.trafficData.data.config.office_types.length; c++) {
                this.state.office_types.push(p.trafficData.data.config.office_types[c]);
                this.state.officeTypeFilter.push(p.trafficData.data.config.office_types[c].id);
            }
            this.setState(this.state);
            changed = true;
        } 
        if (p.trafficData.data && p.trafficData.data.config && p.trafficData.data.config.avail && this.state.categories === null) {
            var c = 0;
            this.state.categories = [];
            this.state.categoriesFilter = [];
            for (c = 0; c < p.trafficData.data.config.categories.length; c++) {
                if (p.trafficData.data.config.categories[c].name === 'Accident') { continue; }
                if (p.trafficData.data.config.categories[c].name === 'Customers') { continue; }
                if (p.trafficData.data.config.categories[c].name === 'No Results') { continue; }
                if (p.trafficData.data.config.categories[c].name === 'Potential Providers') { continue; }
                if (p.trafficData.data.config.categories[c].name === 'Pending Provider') { continue; }
                this.state.categories.push(p.trafficData.data.config.categories[c]);
                this.state.categoriesFilter.push(p.trafficData.data.config.categories[c].id);
            }
            this.setState(this.state);
            changed = true;
        }
        if (changed) {
            this.props.dispatch(
                getTraffic({
                    office_types: this.state.officeTypeFilter,
                    categories: this.state.categoriesFilter,
                })
            )
        }
    }

    componentDidMount() {
        this.props.dispatch(getTraffic({}));
    }

    onOfficeFilterChange(e, t) {
        var g = e.target.value;
        var tar = null;
        var tos = this.props.trafficData.data.data.filter((r) => r.name)
        var tar = tos.filter((f) => f.name.toLowerCase().includes(g.toLowerCase()))
        if (g.length < 1) { tar = []; }
        this.setState({
            officeFilter:e.target.value,
            officeTarget:tar,
        });
    }

    onOfficeTypeChange(e, t) {
        this.state.office_types = e;
        if (this.state.office_types.length < 1) { return; }
        var d = [];
        var c = 0;
        for (c = 0; c < this.state.office_types.length; c++) {
            if (this.state.office_types[c].id) {
                d.push(this.state.office_types[c].id);
            } else {
                d.push(this.state.office_types[c].value);
            }
        }
        this.state.officeTypesFilter = d;
        this.setState(this.state);
        this.props.dispatch(getTraffic({ 
            categories: this.state.categoriesFilter, 
            office_types: d, date: this.state.dateSelected, zipcode: this.state.zipSelected }))
    } 

    onCategoryChange(e, t) {
        this.state.categories = e;
        if (this.state.categories.length < 1) { return; }
        var d = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length; c++) {
            if (this.state.categories[c].id) {
                d.push(this.state.categories[c].id);
            } else {
                d.push(this.state.categories[c].value);
            }
        }
        this.state.categoryTypesFilter = d;
        this.setState(this.state);
        this.props.dispatch(getTraffic({ office_types: this.state.officeTypesFilter, categories: d, date: this.state.dateSelected, zipcode: this.state.zipSelected }))
    }

    onDateChange(e) {
        var t = [];
        var c = 0;
        for (c = 0; c < this.state.categories.length; c++) {
            t.push(this.state.categories[c].id);
        }
        this.state.dateSelected = e.label
        this.setState(this.state);
        this.props.dispatch(getTraffic({ office_types: this.state.officeTypeFilter, categories: this.state.categoriesFilter, 
            date: this.state.dateSelected, zipcode: this.state.zipSelected }))
    }

    onZipChange(e) {
        if (e.target.value) {
            this.state.zipSelected = e.target.value;
            if (e.target.value.length === 5) {
                this.props.dispatch(getTraffic({ office_types: this.state.officeTypeFilter, categories: this.state.categoriesFilter, 
                    date: this.state.dateSelected, zipcode: this.state.zipSelected }));
                // this.geocodeZipcode(e.target.value);
            }
            this.setState(this.state);
        } else {
            this.state.zipSelected = e.label;
            this.setState(this.state);
            this.props.dispatch(getTraffic({ office_types: this.state.officeTypeFilter, categories: this.state.categoriesFilter, 
                date: this.state.dateSelected, zipcode: this.state.zipSelected }));
            // this.geocodeZipcode(e.label);
        }
    }

    onAddressChange(e) {
        this.setState({ address: e.target.value });
    }

    onRouteButtonClick() {
        this.geocodeAddress(this.state.address);
    }
 

    toggleTab(e, t) {
        this.state.activeTab = t;
        this.setState(this.state);
    }

    render() {
        return (
            <>
                {(this.props.trafficData && this.props.trafficData.isReceiving) && (
                    <AppSpinner />
                )}
                <Navbar />
                <Box style={{margin:20}}>
                <div>
                    <Grid container ml={1} mt={5}>
                        <Grid item xs={8} m={1} md={2}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.data &&
                                this.props.trafficData.data.data.length > 0) && (
                                <TemplateTextField
                                    onChange={this.onOfficeFilterChange}
                                    label='Office'
                                    value={this.state.officeFilter}
                                />
                            )}
                        </Grid>
                        <Grid item xs={8} m={1} md={2}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                                this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                                <TemplateTextField
                                    type="text"
                                    id="normal-field"
                                    label="Zipcode"
                                    onChange={this.onZipChange}
                                    placeholder=""
                                    value={this.state.zipSelected}
                                />
                            )}
                        </Grid>
                        <Grid item m={0.5} xs={4} md={4}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                                this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                                <TemplateSelectMulti
                                    onChange={this.onCategoryChange}
                                    label='Category'
                                    value={this.state.categories.map((g) => (
                                        { label: g.label ? g.label : g.name, id: g.id, key: g.id }
                                    ))}
                                    options={this.props.trafficData.data.config.categories.map((e) => (
                                        { label: e.name, value: e.id, key: e.id }
                                    ))}
                                />
                            )}
                        </Grid>
                        <Grid item m={0.5} xs={4} md={3}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.config &&
                                this.props.trafficData.data.config.avail && this.state.dateSelected !== null) && (
                                <TemplateSelectMulti
                                    onChange={this.onOfficeTypeChange}
                                    label='Type'
                                    value={this.state.office_types.map((g) => (
                                        { label: g.label ? g.label : g.name, id: g.id, key: g.id }
                                    ))}
                                    options={this.props.trafficData.data.config.office_types.map((e) => (
                                        { label: e.name, value: e.id, key: e.id }
                                    ))}
                                />
                            )}
                        </Grid>
                    </Grid>
                </div>
                <Grid container spacing={2} style={{ marginLeft: {xs:4}, marginTop: 0 }}>
                    <Grid item xs={12}>
                        <Box sx={{  }}>
                            {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.center) && (
                                <>
                                    <Tabs value={this.state.activeTab} onChange={this.toggleTab} >
                                        <Tab value='traffic' label='Traffic' />
                                        <Tab value='heatmap' label='HeatMap' />
                                        {/*<Tab value='weathermap' label='WeatherMap' />*/}

                                    </Tabs>
                                    {(this.state.activeTab === 'traffic') && (
                                        <TrafficMap targeted={this.state.officeTarget} 
                                            data={this.props.trafficData} centerPoint={this.state.center || this.props.trafficData.data.center} />
                                    )}
                                    {(this.state.activeTab === 'heatmap') && (
                                        <HeatMap data={this.props.trafficData} centerPoint={this.state.center || this.props.trafficData.data.center} />
                                    )}
                                    {/*(this.state.activeTab === 'weathermap') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            <div style={{ flex: '0 1 25%', marginBottom: '10px' }}>
                                                <WeatherCard />
                                            </div>
                                            <div style={{ flex: '1 1 70%' }}>
                                                <WeatherMap 
                                                    targeted={this.state.officeTarget}
                                                    data={this.props.trafficData} 
                                                    centerPoint={this.state.center || this.props.trafficData.data.center} 
                                                />
                                            </div>
                                        </div>
                                    )*/}
                                </>
                            )}
                        </Box>
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
        trafficData: store.trafficData
    }
}

export default connect(mapStateToProps)(Map);
