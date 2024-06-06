import React, { Component } from "react";
import { Map, Circle, Marker, GoogleApiWrapper } from "google-maps-react";
import { Col, Grid } from 'reactstrap';
import googleKey from '../../googleConfig';

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef:null,
      zoomAmounts: [6,8,10],
      zoomCurrent: 6,
      zoomTimer:null,
      delay:5000,
      center:null,
      selected:null
    };
    this.handleMapClick = this.handleMapClick.bind(this);
    this.mapLoaded = this.mapLoaded.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  componentWillReceiveProps(p) { 
    if (false && this.state.center === null) { 
        this.state.center = this.props.centerPoint;
        this.setState(this.state);
    } 
    if (false && this.state.mapRef !== null) { 
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
                "visibility": "on"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "#4b6878"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#64779e"
              }
            ]
          },
          {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#4b6878"
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#334e87"
              }
            ]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#023e58"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#283d6a"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#6f9ba5"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1d2c4d"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#023e58"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#3C7680"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#304a7d"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#98a5be"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1d2c4d"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#2c6675"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#255763"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#b0d5ce"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#023e58"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#98a5be"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1d2c4d"
              }
            ]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#283d6a"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#3a4762"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#0e1626"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#4e6d70"
              }
            ]
          }
        ]
    n.setOptions({styles:styles})
    n.zoom = this.state.zoomAmounts[0];
    this.state.center = this.props.centerPoint;
    n.disableDefaultUI = true;
    n.scrollwheel = false;
    n.draggable = false;
    n.panTo(this.state.center);
    this.state.mapRef = n;
    setTimeout((e) => { e.handleZoom() }, this.state.delay, this)
    this.setState(this.state);
  }

  handleZoom(t) { 
    var g = this.state.zoomAmounts.indexOf(this.state.zoomCurrent);
    if (g === 0) { 
        this.state.center = this.props.centerPoint;
        this.state.center.lng = this.props.centerPoint.lng-5;
    } else { 
        //this.state.center = this.props.centerPoint-5;
    } 
    if (g+1 >= this.state.zoomAmounts.length) { 
        this.state.mapRef.zoom = this.state.zoomAmounts[0];
        this.state.zoomCurrent = this.state.zoomAmounts[0];
        this.state.center = this.props.centerPoint;
        this.state.center.lng += 5;
    } else { 
        this.state.mapRef.zoom = this.state.zoomAmounts[g+1];
        this.state.zoomCurrent = this.state.zoomAmounts[g+1];
    } 
    this.state.mapRef.panTo(this.state.center);
    setTimeout((e) => { e.handleZoom() }, this.state.delay, this)
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
    <>
        <Grid container xs="12">
            <Grid item xs="12">
                <Map
                  google={this.props.google}
                  zoom={4}
                  style={{height:400}}
                  options={{
                    disableDefaultUI: true, // disable default map UI
                    libraries: ['visualization'],
                    draggable: true, // make map draggable
                    libraries:['visualization'],
                    keyboardShortcuts: false, // disable keyboard shortcuts
                    scaleControl: true, // allow scale controle
                    scrollwheel: true, // allow scroll wheel
                  }}
                  onReady={(m,n) => this.mapLoaded(m,n)}
                  onClick={this.handleMapClick}
                >
                {this.props.data.data.data.map((e) => {
                    if (e.category_id === 99) {
                        return (
                          <Marker icon="http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                                data={e} onClick={this.handleMarkerClick}
                                position={e.coords[0]}/>
                        )
                    }
                })}
                </Map>
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
