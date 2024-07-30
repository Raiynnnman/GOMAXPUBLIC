import React, { Component } from "react";
import { HeatMap, Map, Circle, Marker, GoogleApiWrapper } from "google-maps-react";
import Grid from '@mui/material/Grid';
import './Map.scss';
import moment from 'moment';
import googleKey from '../../googleConfig';
import { display } from "@mui/system";

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef:null,
      //center:{lat:0,lng:0},
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
    return (
      <Grid container style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", width: "100%" }}>
      <Grid item xs={12} style={{ width: "100%", height: "60vh", marginBottom: "10px" }}>
        <Map
          google={this.props.google}
          zoom={4}
          style={{ width: "100%", height: "50%", marginTop:60, borderRadius: "10px",   }}
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
          <HeatMap positions={this.props.data.data.heatmap} /> 
        </Map>
      </Grid> 
    </Grid>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: googleKey(),
  libraries: ['visualization']
})(MapContainer);
