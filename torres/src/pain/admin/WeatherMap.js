import React, { Component } from "react";
import { weathermap, Map, Circle, Marker, GoogleApiWrapper } from "google-maps-react";
import Grid from '@mui/material/Grid';
import './Map.scss';
import moment from 'moment';
import googleKey from '../../googleConfig';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef: null,
      center: null,
      selected: null
    };
    this.handleMapClick = this.handleMapClick.bind(this);
    this.mapLoaded = this.mapLoaded.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.center === null && nextProps.centerPoint !== prevState.center) {
      return { center: nextProps.centerPoint };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.mapRef && this.state.center !== prevState.center) {
      this.state.mapRef.panTo(this.state.center);
    }
  }

  handleMarkerClick(ref, map, ev) {
    const location = { lat: ref.data.lat, lng: ref.data.lng };
    this.setState(prevState => ({
      selected: ref.data,
      locations: [...prevState.locations, location]
    }));
  }

  mapLoaded(mapProps, map) {
    const styles = [
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#808080"  
          }
        ]
      },
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#1d2c4d"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
    ];
    map.setOptions({ styles });
    this.setState({ mapRef: map });
  }
  

  handleMapClick(ref, map, ev) {
    const location = ev.latLng;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
    map.panTo(location);
  }

  render() {
    return (
      <Grid container style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", width: "100%" }}>
        <Grid item xs={12} style={{ width: "100%", height: "60vh", marginBottom: "10px" }}>
          <Map
            google={this.props.google}
            zoom={4}
            style={{ width: "100%", height: "50%", marginTop: 60, borderRadius: "10px" }}
            options={{
              disableDefaultUI: true,
              draggable: true,
              keyboardShortcuts: false,
              scaleControl: true,
              scrollwheel: true,
            }}
            initialCenter={this.props.data.centerPoint}
            onReady={this.mapLoaded}
            onClick={this.handleMapClick}
          >
            <weathermap positions={this.props.data.data.weathermap} />
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
