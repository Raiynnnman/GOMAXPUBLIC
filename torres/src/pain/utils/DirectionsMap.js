import React, { useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "react-google-maps";
/* global google */

const DirectionsMap = ({ formattedOrigin, formattedDestination,centerPoint }) => {
  const DirectionsService = new google.maps.DirectionsService();
  let [directions, setDirections] = useState("");
  let [once, setOnce] = useState(false);
  let [delay, setDely] = useState(30000);

  const getDirections = (DirectionsService,formattedOrigin,formattedDestination,setDirections) => { 
      DirectionsService.route(
        {
          origin: formattedOrigin,
          destination: formattedDestination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
    )
    setTimeout((e) => { getDirections(DirectionsService,formattedOrigin,formattedDestination,setDirections) }, delay);
  }
  if (!once) { setOnce(true); getDirections(DirectionsService,formattedOrigin,formattedDestination,setDirections); }
  return (
    <section className="googleMap">
      <GoogleMap defaultZoom={9} defaultCenter={centerPoint}>
        <Marker position={formattedOrigin} />
        <Marker position={formattedDestination} />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </section>
  );
};

export default DirectionsMap;
