import React, { Component } from "react";
import { Map, Circle, Marker, GoogleApiWrapper } from "google-maps-react";
import { Col, Row } from 'reactstrap';
import './Map.scss';
import moment from 'moment';

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
                "color": "#8ec3b9"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1a3646"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#4b6878"
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
            <Col md="8">
                <Map
                  google={this.props.google}
                  style={{width:"1000px",height:"800px"}}
                  zoom={4}
                  options={{
                    disableDefaultUI: true, // disable default map UI
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
                                data={e}
                                icon={accidentMarker}
                                position={e.coords[0]}/>
                            )
                        }
                    if (e.category_id === 99) {
                            if (e.lead_strength_id === 1) { 
                                return (
                                  <Marker onClick={this.handleMarkerClick}
                                    data={e}
                                    icon={locationMarkerPref}
                                    position={e.coords[0]}/>
                                )
                            }
                            if (e.lead_strength_id === 2) { 
                                return (
                                  <Marker onClick={this.handleMarkerClick}
                                    data={e}
                                    icon={locationMarkerInNet}
                                    position={e.coords[0]}/>
                                )
                            }
                            if (e.lead_strength_id === 3) { 
                                return (
                                  <Marker onClick={this.handleMarkerClick}
                                    data={e}
                                    icon={locationMarkerPotent}
                                    position={e.coords[0]}/>
                                )
                            }
                        }
                    if (e.category_id === 100) {
                            return (
                              <Marker position={e.coords[0]}/>
                            )
                        }
                })}
                </Map>
            </Col>
            <Col md="4" style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}}>
                <Row md="12" style={{margin:20}}></Row>
                <div style={{height:800,overflow:"auto"}}>
                    <Row md="12" style={{margin:20}}></Row>
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
                                Office
                            </Col>
                            <Col md="8">
                                {this.state.selected.name}
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
                    {(this.state.selected.category_id !== 99) && (
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
  libraries: []
})(MapContainer);
