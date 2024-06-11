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
      <div style={{zIndex:1,borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="map-container">
        <Grid container xs="12">
            <Grid item xs="7" style={{position:"relative"}}>
                <Map
                  google={this.props.google}
                  style={{margin:10,position:"relative",width:"100%",height:"600px"}}
                  zoom={4}
                  options={{
                    disableDefaultUI: true, // disable default map UI
                    libraries: ['visualization'],
                    draggable: true, // make map draggable
                    keyboardShortcuts: false, // disable keyboard shortcuts
                    scaleControl: true, // allow scale controle
                    scrollwheel: true, // allow scroll wheel
                  }}
                  initialCenter={this.props.data.centerPoint}
                  onReady={(m,n) => this.mapLoaded(m,n)}
                  onClick={this.handleMapClick}
                >
                {this.props.data.data.data.map((e) => {
                    if (e.category_id === 2) {
                            return (
                              <Marker onClick={this.handleMarkerClick}
                                onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                data={e}
                                icon={accidentMarker}
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
                                    icon={locationMarkerInNet}
                                    position={e.coords[0]}/>
                                )
                            }
                            if (e.lead_strength_id === 3) { 
                                return (
                                  <Marker onClick={this.handleMarkerClick}
                                    onMouseover={this.onMouseover} onMouseout={this.onMouseout}
                                    data={e}
                                    icon={locationMarkerPotent}
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
            <Grid item xs="5" style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
                <div style={{height:600,overflow:"auto"}}>
                    <Grid container xs="12" style={{margin:20}}>
                        <Grid item xs="12">
                        <>
                            {(this.state.sticky) && (
                                <PushPinIcon style={{color:"red"}}/>
                            )}
                            {(!this.state.sticky) && (
                                <PushPinIcon style={{color:"black"}}/>
                            )}
                        </>
                        </Grid>
                    </Grid>
                    {(this.state.selected === null) && (
                    <Grid container xs="12" style={{margin:20}}>
                        <Grid item xs="12">
                            <h4>No marker selected!</h4>
                        </Grid>
                    </Grid>
                    )}
                    {(this.state.selected !== null) && (
                    <>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Metadata
                        </Grid>
                    </Grid>
                    {(this.state.selected.category_id) === 99 && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Name
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.providers.map((g) => { 
                                    return (
                                    <>
                                        Name: {g.first_name + " " + g.last_name}
                                        <br/>
                                        email: {g.email}
                                        <br/>
                                    </>
                                    )
                                })}
                            </Grid>
                        </Grid>
                    )}
                    {(this.state.selected.category_id === 101) && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Office
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.name}
                            </Grid>
                        </Grid>
                    )}
                    {(this.state.selected.category_id) === 104 && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Office
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.name}
                            </Grid>
                        </Grid>
                    )}
                    {(this.state.selected.category_id) === 99 && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Office
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.name}
                            </Grid>
                        </Grid>
                    )}
                    {(this.state.selected.category_id === 104) && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Website    
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.website}
                            </Grid>
                        </Grid>
                    )}
                    {(this.state.selected.category_id === 99) && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Website    
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.website}
                            </Grid>
                        </Grid>
                    )}
                    {(this.state.selected.category_id !== 99) && (
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                UUID 
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.uuid.substring(0,10)}
                            </Grid>
                        </Grid>
                    )}
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Type
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.category}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Address
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.addr1}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            City
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.city}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            State
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.state}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Zipcode
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.zipcode}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Phone
                        </Grid>
                        <Grid item xs="8">
                            {formatPhoneNumber(this.state.selected.phone)}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Latitude
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.lat}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Longitude
                        </Grid>
                        <Grid item xs="8">
                            {this.state.selected.lng}
                        </Grid>
                    </Grid>
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Delay
                        </Grid>
                        <Grid item xs="8">
                            {!this.state.selected.traf_delay ? "N/A" : this.state.selected.traf_delay}
                        </Grid>
                    </Grid>
                    {(this.state.selected.category_id === 99) && (
                    <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Grid item xs="4">
                            Lead Strength
                        </Grid>
                        <Grid item xs="8">
                            {!this.state.selected.lead_strength ? "N/A" : this.state.selected.lead_strength}
                        </Grid>
                    </Grid>
                    )}
                    {(this.state.selected.category_id === 1) && (
                        <>
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Start
                            </Grid>
                            <Grid item xs="8">
                                {moment(this.state.selected.traf_start_time).format('LLL')} (UTC)
                            </Grid>
                        </Grid>
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                End
                            </Grid>
                            <Grid item xs="8">
                                {moment(this.state.selected.traf_end_time).format('LLL')} (UTC)
                            </Grid>
                        </Grid>
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Magnitude
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.traf_magnitude}
                            </Grid>
                        </Grid>
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                # Reports
                            </Grid>
                            <Grid item xs="8">
                                {this.state.selected.traf_num_reports}
                            </Grid>
                        </Grid>
                        <Grid container xs="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Grid item xs="4">
                                Client Data
                            </Grid>
                            <Grid item xs="8">
                                Pending
                            </Grid>
                        </Grid>
                    </>
                    )}
                    </>
                    )}
                </div>
            </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: googleKey(),
  libraries: ['visualization']
})(MapContainer);
