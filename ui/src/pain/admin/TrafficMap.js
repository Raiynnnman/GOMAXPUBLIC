import React, { Component } from "react";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
import './Map.scss';

const MarkersList = props => {
  const { locations, ...markerProps } = props;
  return (
    <span>
      {locations.map((location, i) => {
        return (
          <Marker
            key={i}
            {...markerProps}
            position={{ lat: 25.88106346130371, lng: -80.3885650634765 }}
          />
        );
      })}
    </span>
  );
};

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: []
    };
    this.handleMapClick = this.handleMapClick.bind(this);
  }

  handleMapClick = (ref, map, ev) => {
    const location = ev.latLng;
    this.setState(prevState => ({
      locations: [...prevState.locations, location]
    }));
    map.panTo(location);
  };

  render() {
    console.log("p1",this.props);
    return (
      <div className="map-container">
        <Map
          google={this.props.google}
          style={{width:"1000px",height:"800px"}}
          zoom={8}
          initialCenter={this.props.data.centerPoint}
          onClick={this.handleMapClick}
        >
        {this.props.data.data.data.map((e) => {
            if (e.category_id === 1) {
                    console.log("coords",e.coords[0]);
                    return (
                      <Marker
                        position={e.coords[0]}/>
                    )
                }
        })}
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCjn4U7o_J0AHbNBvkyijucaX_KgTU-46w",
  libraries: []
})(MapContainer);
