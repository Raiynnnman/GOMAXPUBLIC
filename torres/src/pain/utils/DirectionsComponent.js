import React, { useState, useEffect, Component } from 'react';
import { TextField, Grid, Paper, Typography, Button } from '@mui/material';
import googleKey from '../../googleConfig';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

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
    console.log(origin, destination);
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

export default DirectionsComponent;
