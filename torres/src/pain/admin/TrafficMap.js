import React, { Component } from "react";
import { HeatMap, Map, Marker, GoogleApiWrapper } from "google-maps-react";
import Grid from '@mui/material/Grid';
import googleKey from '../../googleConfig';
import MapMetaData from "../../components/MapMetaData";

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef:null,
      showInfoWindow:false,
      selected:null,
      sticky:false,
      //center:{lat:0,lng:0},
      center:null
    };
    this.handleMapClick = this.handleMapClick.bind(this);
    this.mapLoaded = this.mapLoaded.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.centerPoint !== prevProps.centerPoint) {
      this.setState({ center: this.props.centerPoint });
      if (this.state.mapRef) {
        this.state.mapRef.panTo(this.props.centerPoint);
      }
    }
  }

  handleMarkerClick(ref, map, ev) {
    const location = { lat: ref.data.lat, lng: ref.data.lng };
    this.setState({
      selected: ref.data,
      locations: [...this.state.locations, location]
    });
  }

  mapLoaded(map, maps) { 
    var styles = 
        [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "white"
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
    maps.setOptions({styles:styles})
    this.state.center = this.props.centerPoint;
    this.state.center.lng += 5;
    maps.disableDefaultUI = true;
    maps.scrollwheel = true;
    maps.panTo(this.state.center);
    this.setState({ mapRef: maps });
  }

  handleMapClick(ref, map, ev) {
    const location = ev.latLng;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
    map.panTo(location);
  }

  render() {
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
        width: '95%',
        height: '95%',
        maxWidth: '900px',
        maxHeight: '600px',
        borderRadius: '10px',
        marginLeft:'auto',
        marginRight: 'auto',
      }
    };

    return (
      <Grid container spacing={2} sx={styles.mapContainer}>
        <Grid item xs={12} md={6} sx={{  order: { xs: 1, md: 2 }, width: '100%', justifyContent: 'center' }}>
          <MapMetaData selected={this.state.selected} />
        </Grid>
        <Grid item xs={1} md={6} sx={styles.mapItem}>
          <Map
            google={this.props.google}
            zoom={4}
            style={styles.map}
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
            {this.props.data.data.data.map((e) => {
                if (e.category_id === 2) {
                        return (
                          <Marker onClick={this.handleMarkerClick}
                            onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                            data={e}
                            icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            position={e.coords[0]}/>
                        )
                    }
                if (e.category_id === 99) {
                        if (e.lead_strength_id === 1) { 
                            return (
                              <Marker onClick={this.handleMarkerClick}
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                data={e}
                                icon="http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                                position={e.coords[0]}/>
                            )
                        }
                        if (e.lead_strength_id === 2) { 
                            return (
                              <Marker onClick={this.handleMarkerClick}
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                data={e}
                                icon="http://maps.google.com/mapfiles/ms/icons/oranige-dot.png"
                                position={e.coords[0]}/>
                            )
                        }
                        if (e.lead_strength_id === 3) { 
                            return (
                              <Marker onClick={this.handleMarkerClick}
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                icon="http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
                                data={e}
                                position={e.coords[0]}/>
                            )
                        }
                    }
                if (e.category_id === 101) {
                        return (
                          <Marker icon="http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                data={e} onClick={this.handleMarkerClick}
                                position={e.coords[0]}/>
                        )
                    }
                if (e.category_id === 104) {
                        return (
                          <Marker icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                data={e} onClick={this.handleMarkerClick}
                                position={e.coords[0]}/>
                        )
                    }
                if (e.category_id === 103) {
                        return (
                          <Marker icon="http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                data={e} onClick={this.handleMarkerClick}
                                position={e.coords[0]}/>
                        )
                    }
                if (e.category_id === 100) {
                        return (
                          <Marker position={e.coords[0]}
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}/>
                        )
                    }
            })}
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
