import React, { Component } from "react";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
import { Col, Row } from 'reactstrap';
import './Map.scss';
import moment from 'moment';

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      selected:null
    };
    this.handleMapClick = this.handleMapClick.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  handleMarkerClick(ref,map,ev) { 
    var location = {lat:ref.data.lat,lng:ref.data.lon};
    this.state.selected = ref.data;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
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
      <div style={{zIndex:1,borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="map-container">
        <Row md="12">
            <Col md="8">
                <Map
                  google={this.props.google}
                  style={{width:"1000px",height:"800px"}}
                  zoom={4}
                  initialCenter={this.props.data.centerPoint}
                  onClick={this.handleMapClick}
                >
                {this.props.data.data.data.map((e) => {
                    if (e.category_id === 2) {
                            return (
                              <Marker onClick={this.handleMarkerClick}
                                data={e}
                                position={e.coords[0]}/>
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
                    <Row md="12" style={{margin:10, borderBottom:"1px solid black"}}>
                        <Col md="4">
                            UUID 
                        </Col>
                        <Col md="8">
                            {this.state.selected.uuid.substring(0,10)}
                        </Col>
                    </Row>
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
                            {this.state.selected.lon}
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
