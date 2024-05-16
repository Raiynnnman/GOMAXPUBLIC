import React, { Component } from "react";
import { InfoWindow, Map, Circle, Marker, GoogleApiWrapper } from "google-maps-react";
import { Col, Row } from 'reactstrap';
import PushPinIcon from '@mui/icons-material/PushPin';
import './Map.scss';
import moment from 'moment';
import formatPhoneNumber from '../utils/formatPhone';

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mapRef:null,
      showInfoWindow:false,
      selected:null,
      sticky:false,
      //center:{lat:0,lng:0},
      center:null,
      selected:null
    };
    this.handleMapClick = this.handleMapClick.bind(this);
    this.mapLoaded = this.mapLoaded.bind(this);
    this.onMouseout = this.onMouseout.bind(this);
    this.onMouseover = this.onMouseover.bind(this);
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

  onMouseover(e) { 
    if (this.state.sticky) { return; }
    if (!e.data) { return; }
    this.state.selected = e.data;
    this.state.showInfoWindow = true;
    this.setState(this.state)
  }

  onMouseout(e) { 
    if (this.state.sticky) { return; }
    this.state.selected = null;
    this.state.showInfoWindow = false;
    this.setState(this.state)
  }

  handleMarkerClick(ref,map,ev) { 
    var location = {lat:ref.data.lat,lng:ref.data.lng};
    this.state.selected = ref.data;
    this.state.sticky = this.state.sticky ? false : true;
    this.setState(this.state);
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
    n.setOptions({styles:styles})
    this.state.center = this.props.centerPoint;
    this.state.center.lng += 5;
    n.disableDefaultUI = true;
    n.scrollwheel = true;
    n.panTo(this.state.center);
    this.state.mapRef = n;
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
      const accidentMarker = {
        // path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        path:  'M -2,0 0,-2 2,0 0,2 z',
        fillColor: "#dc1a1a",
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(0, 20),
     };
      const locationMarkerPref = {
        //path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        //#path:"M0,0h100v100h-100v-100M60,50a10,10 0 0 0 -20,0a10,10 0 0 0 20,0",
        path:  'M -2,0 0,-2 2,0 0,2 z',
        fillOpacity: 1,
        fillColor: "#2cad01",
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(0, 20),
     };
      const locationMarkerInNet = {
        //path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        //#path:"M0,0h100v100h-100v-100M60,50a10,10 0 0 0 -20,0a10,10 0 0 0 20,0",
        path:  'M -2,0 0,-2 2,0 0,2 z',
        fillOpacity: 1,
        fillColor: "#f84404",
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(0, 20),
     };
      const locationMarkerPotent = {
        //path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        //#path:"M0,0h100v100h-100v-100M60,50a10,10 0 0 0 -20,0a10,10 0 0 0 20,0",
        path:  'M -2,0 0,-2 2,0 0,2 z',
        fillOpacity: 1,
        fillColor: "yellow",
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(0, 20),
     };
    return (
      <div style={{zIndex:1,borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="map-container">
        <Row md="12">
            <Col md="7" style={{position:"relative"}}>
                <Map
                  google={this.props.google}
                  style={{margin:10,position:"relative",width:"100%",height:"600px"}}
                  zoom={4}
                  options={{
                    disableDefaultUI: true, // disable default map UI
                    libraries: ['visualization'],
                    draggable: true, // make map draggable
                    libraries:['visualization'],
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
            </Col>
            <Col md="5" style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
                <div style={{height:600,overflow:"auto"}}>
                    <Row md="12" style={{margin:20}}>
                        <Col md="12">
                        <>
                            {(this.state.sticky) && (
                                <PushPinIcon style={{color:"red"}}/>
                            )}
                            {(!this.state.sticky) && (
                                <PushPinIcon style={{color:"black"}}/>
                            )}
                        </>
                        </Col>
                    </Row>
                    {(this.state.selected === null) && (
                    <Row md="12" style={{margin:20}}>
                        <Col md="12">
                            <h4>No marker selected!</h4>
                        </Col>
                    </Row>
                    )}
                    {(this.state.selected !== null) && (
                    <>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Metadata
                        </Col>
                    </Row>
                    {(this.state.selected.category_id) === 99 && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Name
                            </Col>
                            <Col md="8">
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
                            </Col>
                        </Row>
                    )}
                    {(this.state.selected.category_id === 101) && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Office
                            </Col>
                            <Col md="8">
                                {this.state.selected.name}
                            </Col>
                        </Row>
                    )}
                    {(this.state.selected.category_id) === 104 && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Office
                            </Col>
                            <Col md="8">
                                {this.state.selected.name}
                            </Col>
                        </Row>
                    )}
                    {(this.state.selected.category_id) === 99 && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Office
                            </Col>
                            <Col md="8">
                                {this.state.selected.name}
                            </Col>
                        </Row>
                    )}
                    {(this.state.selected.category_id === 104) && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Website    
                            </Col>
                            <Col md="8">
                                {this.state.selected.website}
                            </Col>
                        </Row>
                    )}
                    {(this.state.selected.category_id === 99) && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Website    
                            </Col>
                            <Col md="8">
                                {this.state.selected.website}
                            </Col>
                        </Row>
                    )}
                    {(this.state.selected.category_id !== 99) && (
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                UUID 
                            </Col>
                            <Col md="8">
                                {this.state.selected.uuid.substring(0,10)}
                            </Col>
                        </Row>
                    )}
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Type
                        </Col>
                        <Col md="8">
                            {this.state.selected.category}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Address
                        </Col>
                        <Col md="8">
                            {this.state.selected.addr1}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            City
                        </Col>
                        <Col md="8">
                            {this.state.selected.city}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            State
                        </Col>
                        <Col md="8">
                            {this.state.selected.state}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Zipcode
                        </Col>
                        <Col md="8">
                            {this.state.selected.zipcode}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Phone
                        </Col>
                        <Col md="8">
                            {formatPhoneNumber(this.state.selected.phone)}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Latitude
                        </Col>
                        <Col md="8">
                            {this.state.selected.lat}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Longitude
                        </Col>
                        <Col md="8">
                            {this.state.selected.lng}
                        </Col>
                    </Row>
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Delay
                        </Col>
                        <Col md="8">
                            {!this.state.selected.traf_delay ? "N/A" : this.state.selected.traf_delay}
                        </Col>
                    </Row>
                    {(this.state.selected.category_id === 99) && (
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            Lead Strength
                        </Col>
                        <Col md="8">
                            {!this.state.selected.lead_strength ? "N/A" : this.state.selected.lead_strength}
                        </Col>
                    </Row>
                    )}
                    {(this.state.selected.category_id === 1) && (
                        <>
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Start
                            </Col>
                            <Col md="8">
                                {moment(this.state.selected.traf_start_time).format('LLL')} (UTC)
                            </Col>
                        </Row>
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                End
                            </Col>
                            <Col md="8">
                                {moment(this.state.selected.traf_end_time).format('LLL')} (UTC)
                            </Col>
                        </Row>
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Magnitude
                            </Col>
                            <Col md="8">
                                {this.state.selected.traf_magnitude}
                            </Col>
                        </Row>
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                # Reports
                            </Col>
                            <Col md="8">
                                {this.state.selected.traf_num_reports}
                            </Col>
                        </Row>
                        <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                            <Col md="4">
                                Client Data
                            </Col>
                            <Col md="8">
                                Pending
                            </Col>
                        </Row>
                    </>
                    )}
                    </>
                    )}
                </div>
            </Col>
        </Row>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCjn4U7o_J0AHbNBvkyijucaX_KgTU-46w",
  libraries: ['visualization']
})(MapContainer);
