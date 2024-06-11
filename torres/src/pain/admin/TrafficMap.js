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
            <HeatMap positions={this.props.data.data.heatmap} />
            {this.props.data.data.data.map((e, index) => (
              <Marker
                key={`marker-${index}`}
                onClick={this.handleMarkerClick}
                data={e}
                position={e.coords[0]}
              />
            ))}
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
