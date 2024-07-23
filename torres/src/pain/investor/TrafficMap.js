import React, { useState, useEffect, Component } from 'react';
import { TextField, Grid, Paper, Typography, Button } from '@mui/material';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  IconButton,
} from '@mui/material';
import googleKey from '../../googleConfig';
import moment from 'moment';
import MapMetaData from "../../components/MapMetaData";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { HeatMap, GoogleApiWrapper } from "google-maps-react";
import DirectionsComponent from '../utils/DirectionsComponent';
import GoogleAutoComplete from '../utils/GoogleAutoComplete';
import PainTable from '../utils/PainTable';
import UserCard from './UserCard';
import TemplateButton from '../utils/TemplateButton';
import AccidentIcon from '../../assets/maki_road-accident.png';

const timeZoneIANA = Intl.DateTimeFormat().resolvedOptions().timeZone;

const darkModeStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1e1e1e" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#808080" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e1e1e" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#808080" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0b0b0" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d0d0d0" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#808080" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#171717" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#505050" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a1a1a" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2b2b2b" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#909090" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#d9502e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#002060" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#000000" }] }
];

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef: null,
      center:{lat:0,lng:0},
      showInfoWindow: false,
      selected: null,
      office:null,
      sticky: false,
      origin: '',
      destination: '',
      fetchDirections: false,
      routes: [],
      activeSubTab: 'information',
      selectedRouteIndex: 0,
    };
  }

  componentWillReceiveProps(p) { 
    if (p.centerPoint && p.centerPoint.lat !== this.state.center.lat &&
        p.centerPoint.lng !== this.state.center.lng && this.state.mapRef) { 
        this.state.mapRef.panTo(p.centerPoint);
        this.state.center = p.centerPoint;
        this.setState(this.state);
    } 
  } 

  cancel = () => { 
    this.state.selected = null;
    this.setState(this.state)
  }
  viewRow = (c,r) => { 
    this.state.selected = c
    this.setState(this.state)
  } 

  toggleSubTab = (r,g) => { 
    this.setState({activeSubTab:g})
  } 

  handleMarkerClick = (ref, map) => {
    const location = ref.addr1 + " " + ref.city + " " + ref.state;
    this.setState({ office: ref, destination: location });
  };

  updateAddress = (r) => { 
    this.setState({origin:r.fulladdr});
  } 

  handleMapLoad = (ref, map, ev) => {
    this.state.mapRef = ref.map;
    this.setState(this.state);
  } 

  handleMapClick = (ref, map, ev) => {
    const location = ev.latLng;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
    map.panTo(location);
  };

  handleFetchDirections = () => {
    this.setState({ fetchDirections: true });
  };

  handleRouteSelect = (index) => {
    this.setState({ selectedRouteIndex: index });
  };


  generateGoogleMapsUrl = () => {
    const { origin, destination } = this.state;
    if (!origin || !destination) return '#';
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  };

  render() {
    console.log("tz",timeZoneIANA);
    console.log("p",this.props);
    console.log("win",window);
    const styles = {
      mapContainer: {
        justifyContent: 'center',
        marginTop: { xs: '20px', md: '100px' },
      },
      mapItem: {
        height: { xs: '60vh', md: '50vh' },
        justifyContent: 'center',
        display: 'flex'
      },
      map: {
        width: '100%',
        height: '100%',
        maxWidth: '900px',
        maxHeight: '600px',
        borderRadius: '10px',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      directions: {
        padding: '20px',
        maxHeight: '60vh',
        overflowY: 'auto',
        
        width: '100%',
        marginBottom: '20px',
      },
      selectedBox: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        
      },
      directionsButton: {
        textAlign: 'center',
        margin: '20px 0',
        color: '#FFA500', // Orange color
      },
    };

    const position = this.props.data.data.center;
    var heads = [
        {
            dataField:'uuid',
            text:'ID',
            onClick: (content,row) => (
                this.viewRow(content,row)
            ),
            formatter: (cellContent,row) => (
                <div>
                    {row.uuid.substring(0,8)}
                </div>
            )
        },
        {
            dataField:'city',
            text:'Location',
            align:'center',
            formatter: (cellContent,row) => (
                <div>
                    {row.city + ", " + row.state}
                </div>
            )
        },
        {
            dataField:'lat',
            text:'Lat/Lng',
            hideOnMobile:true,
            align:'center',
            formatter: (cellContent,row) => (
                <div>
                    {row.lat+ ", " + row.lng}
                </div>
            )
        },
        {
            dataField:'traf_from',
            text:'Intersection',
            hideOnMobile:true,
            align:'center',
            formatter: (cellContent,row) => (
                <div>
                    {row.traf_from}
                </div>
            )
        },
        {
            dataField:'traf_start_time',
            text:'Incident Time',
            align:'center',
            formatter: (cellContent,row) => (
                <div>
                    {
                        moment(row.traf_start_time).utcOffset(row.tz_hours).format("LLL") + " (" + row.tz_short + ")" 
                    }
                </div>
            )
        },
    ]
    console.log("p",this.props);
    console.log("s",this.state);
    return (
    <>
        {(!this.state.selected) && (
        <>
          <Grid container spacing={2} sx={{ mt: 0, mr: 2 }}>
            <Grid item xs={12} md={12}>
              <APIProvider apiKey={googleKey()}>
                <Map
                    style={{ width: '100%', height: '50vh' }}
                    defaultCenter={position}
                    onIdle={this.handleMapLoad}
                    defaultZoom={4}
                    disableDefaultUI={true}
                    gestureHandling={'greedy'}
                    fullscreenControl={false}
                    options={{ styles: darkModeStyle }} // Apply dark mode style here
                >
                  {(this.props.targeted && this.props.targeted.length < 1) && this.props.data.data.data.map((e) => {
                    let markerProps = {
                      onClick: (map) => this.handleMarkerClick(e, map),
                      position: e.coords[0],
                      data: e,
                    };
                    return <Marker key={e.index} {...markerProps} icon={{ 
                            url:'/maki_road-accident.png',
                            scaledSize:{width:30,height:30}
                          }} />
                  })}
                </Map>
              </APIProvider>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 0, mr: 2 }}>
            <Grid item xs={12} md={12}>
                <font style={{"color":"lightgreen"}}>Refresh: {this.props.nextReloadTimer}</font>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ marginTop:0, paddingTop:0 }}>
            <Grid item xs={12} md={12}>
                  <PainTable
                        keyField='id' 
                        minWidth={300}
                        headerBackgroundColor="black"
                        headerColor="lightgreen"
                        dataColor="lightgreen"
                        dataBackgroundColor="black"
                        data={this.props.data.data.data} 
                        total={this.props.data.total}
                        noPaging
                        page={this.state.page}
                        pageSize={this.state.pageSize}
                        onPageChange={this.pageChange}
                        onPageGridsPerPageChange={this.pageGridsChange}
                        columns={heads}>
                  </PainTable> 
            </Grid>
          </Grid>
      </>
      )}
      {(this.state.selected) && (
        <div style={{height:"100%vh"}}>
          <Grid container spacing={2} sx={{ height:800,mt: 5, mr: 2 }}>
            <Grid item xs={12} md={6}>
                    <UserCard data={this.state.selected} onCancel={this.cancel}/>
            </Grid>
          </Grid>
        </div>
      )}
    </>
    );
  }

  getMarkerIcon(e) {
    return <AccidentIcon />
  }
}


export default GoogleApiWrapper({
  apiKey: googleKey(),
  libraries: ['visualization','places']
})(MapContainer);
