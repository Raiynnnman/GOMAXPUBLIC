import React, { useState, useEffect, Component } from 'react';
import { TextField, Grid, Paper, Typography, Button } from '@mui/material';
import googleKey from '../../googleConfig';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

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
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#d9502e" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#d9502e" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#d9502e" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#d9502e" }] },
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
      showInfoWindow: false,
      selected: null,
      sticky: false,
      origin: '',
      destination: '',
      fetchDirections: false,
      routes: [],
      selectedRouteIndex: 0,
    };
  }

  handleMarkerClick = (ref, map) => {
    const location = ref.addr1 + " " + ref.city + " " + ref.state;
    this.setState({ destination: location, origin: this.props.data.data.center });
  };

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
    return (
      <Grid container spacing={2} sx={{ mt: 5, mr: 2 }}>
        <Grid item xs={12} md={8}>
          <APIProvider apiKey={googleKey()}>
            <Map
                style={{ width: '100%', height: '50vh' }}
                defaultCenter={position}
                defaultZoom={9}
                gestureHandling={'greedy'}
                fullscreenControl={false}
                options={{ styles: darkModeStyle }} // Apply dark mode style here
            >
              {this.props.data.data.data.map((e) => {
                let markerProps = {
                  onClick: (map) => this.handleMarkerClick(e, map),
                  position: e.coords[0],
                  data: e,
                  icon: this.getMarkerIcon(e),
                };
                return <Marker key={e.index} {...markerProps} />;
              })}
            </Map>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#FFA500' }} // Orange color
              onClick={this.handleFetchDirections}
              fullWidth
            >
              Get Directions
            </Button>
            {this.state.fetchDirections && (
              <DirectionsComponent
                origin={this.state.origin}
                destination={this.state.destination}
                onRouteSelect={this.handleRouteSelect}
                routes={this.state.routes}
                selectedRouteIndex={this.state.selectedRouteIndex}
                setRoutes={(routes) => this.setState({ routes })}
              />
            )}
            {this.state.selected && (
              <div style={styles.selectedBox}>
                <Typography variant="h6">Selected Location</Typography>
                <Typography variant="body2">Lat: {this.state.selected.lat}</Typography>
                <Typography variant="body2">Lng: {this.state.selected.lng}</Typography>
              </div>
            )}
          </APIProvider>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={styles.directions}>
            <Grid container spacing={2}>
              {this.state.routes.map((route, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    elevation={3}
                    onClick={() => this.handleRouteSelect(index)}
                    style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', backgroundColor: index === this.state.selectedRouteIndex ? '#f0f0f0' : '#fff' }}
                  >
                    <Typography variant="subtitle1">{route.summary}</Typography>
                    <Typography variant="body2">Distance: {route.legs[0].distance.text}</Typography>
                    <Typography variant="body2">Duration: {route.legs[0].duration.text}</Typography>
                  </Paper>
                </Grid>
              ))}
              {this.state.routes.length > 0 && (
                <Grid item xs={12}>
                  <Paper style={{ padding: '10px', marginTop: '20px', borderRadius: 10 }}>
                    <Typography variant="subtitle1">Route Summary: {this.state.routes[this.state.selectedRouteIndex].summary}</Typography>
                    <Typography variant="body2">Distance: {this.state.routes[this.state.selectedRouteIndex].legs[0].distance.text}</Typography>
                    <Typography variant="body2">Duration: {this.state.routes[this.state.selectedRouteIndex].legs[0].duration.text}</Typography>
                    <Typography variant="body2">Start Address: {this.state.routes[this.state.selectedRouteIndex].legs[0].start_address}</Typography>
                    <Typography variant="body2">End Address: {this.state.routes[this.state.selectedRouteIndex].legs[0].end_address}</Typography>
                    <div style={styles.directionsButton}>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#FFA500' }} // Orange color
                        href={this.generateGoogleMapsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </Button>
                    </div>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  getMarkerIcon(e) {
    switch (e.category_id) {
      case 2:
        return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
      case 99:
        if (e.lead_strength_id === 1 && e.office_type_id === 1) {
          return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        } else if (e.lead_strength_id === 2 && e.office_type_id === 1) {
          return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        } else if (e.lead_strength_id === 3 && e.office_type_id === 1) {
          return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
        }
        break;
      case 101:
        return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
      case 104:
        if (e.office_type_id === 1) {
          return "https://maps.gstatic.com/mapfiles/ms2/micons/red-pushpin.png";
        } else if (e.office_type_id === 6) {
          return "https://maps.gstatic.com/mapfiles/ms2/micons/ylw-pushpin.png";
        }
        break;
      case 103:
        return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
      case 100:
        return null;
      default:
        return null;
    }
  }
}

function DirectionsComponent({ origin, destination, onRouteSelect, routes, selectedRouteIndex, setRoutes }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsRenderer || !directionsService || !origin || !destination) return;

    const fetchDirections = async () => {
      try {
        const response = await directionsService.route({
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        });

        directionsRenderer.setDirections(response);
        onRouteSelect(0);  
        setRoutes(response.routes);
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    };
    fetchDirections();
  }, [directionsRenderer, directionsService, origin, destination]);

  useEffect(() => {
    if(!directionsRenderer) return;
    directionsRenderer.setRouteIndex(selectedRouteIndex)
  },[selectedRouteIndex,directionsRenderer])

  return null; 
}

export default MapContainer;
