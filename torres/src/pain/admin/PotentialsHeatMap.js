import React, { Component } from "react";
import { HeatMap, Map, Circle, Marker, GoogleApiWrapper } from "google-maps-react";
import Grid from '@mui/material/Grid';
import './Map.scss';
import moment from 'moment';
import googleKey from '../../googleConfig';
import { display } from "@mui/system";
import PainTable from '../utils/PainTable';

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef:null,
      //center:{lat:0,lng:0},
      page: 0,
      pageSize: 10,
      center:null,
      selected:null
    };
    this.handleMapClick = this.handleMapClick.bind(this);
    this.mapLoaded = this.mapLoaded.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }
  componentWillReceiveProps(p) { 
    if (this.state.center === null) { 
        this.state.center = this.props.centerPoint;
        this.setState(this.state);
    } 
    if (this.state.mapRef !== null) { 
        this.state.center = this.props.centerPoint;
        this.state.mapRef.panTo(this.state.center);
        this.setState(this.state);
    } 
  }

  handleMarkerClick(ref,map,ev) { 
    var location = {lat:ref.data.lat,lng:ref.data.lng};
    this.state.selected = ref.data;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
  }

  mapLoaded(m,n) { 
    var styles = 
        [
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
        ]
    n.setOptions({styles:styles})
    this.setState(this.state);
  }

  handleMapClick(ref,map,ev) { 
    const location = ev.latLng;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
    map.panTo(location);
  }; 

  render() {
    var heads = [
        { 
        dataField:'zipcode',
        align:'center',
        text:'Zip Code'
        },
        { 
        dataField:'city',
        align:'center',
        text:'City'
        },
        { 
        dataField:'state',
        align:'center',
        text:'State'
        },
        { 
        dataField:'accidents',
        align:'center',
        text:'Accidents'
        },
        { 
        dataField:'innetwork',
        align:'center',
        text:'In Network'
        },
        { 
        dataField:'potential',
        align:'center',
        text:'Potential'
        },
        { 
        dataField:'weight',
        align:'center',
        text:'weight'
        },
    ]
    return (
    <>
          <Grid container xs={12} style={{ marginTop:20 }}>
              <Grid item xs={12} style={{ width: "100%", height: "60vh" }}>
                <Map
                  google={this.props.google}
                  zoom={4}
                  style={{ width: "100%", height: "50%", borderRadius: "10px",   }}
                  options={{
                    disableDefaultUI: true,
                    libraries: ['visualization'],
                    draggable: true,
                    keyboardShortcuts: false,
                    scaleControl: true,
                    scrollwheel: true,
                  }}
                  initialCenter={this.props.data.centerPoint}
                  onReady={this.mapLoaded}
                  onClick={this.handleMapClick}
                >
                  <HeatMap positions={this.props.data.data.heatmap_potentials} /> 
                </Map>
              </Grid> 
          </Grid>
          <Grid container xs={12}> 
              <Grid item xs={12}> 
                  <PainTable
                        keyField='id' 
                        data={this.props.data.data.heatmap_potentials} 
                        total={this.props.data.data.heatmap_potentials.length}
                        page={0}
                        pageSize={this.props.data.data.heatmap_potentials.length}
                        onPageChange={this.pageChange}
                        columns={heads}>
                  </PainTable> 
              </Grid>
           </Grid>
    </>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: googleKey(),
  libraries: ['visualization']
})(MapContainer);
