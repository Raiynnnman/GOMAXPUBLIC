<template>
    <div class="pb-3 px-3 d-flex">
        <InputText placeholder="Search for a place" class="w-70 me-4 p-input-normal" id="search-box" />
        <Button label="search" @click="searchPlaces"></Button>
    </div>
    <div>
        <GoogleMap id="map" :api-promise="apiPromise" style="width: 100vw; height: 70vh">
            <Marker v-for="(place, index) in searchResults" :key="index" :options="{position: place.geometry.location}" />
        </GoogleMap>
    </div>
    <div>

    </div>
</template>

<script setup>
import { onActivated, onMounted, ref, defineProps, nextTick } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
const loader = new Loader({
    apiKey:
        'AIzaSyDnFCHKJCZPEfgF9nD4ljZHweuOy6XrfCk',
    version: 'weekly',
    libraries: ['places'],
});

const searchResults = ref([]); // List of places returned by the search
let mapInstance = null; // Map instance
let placesService = null; // PlacesService instance

const apiPromise = loader.load();
const props = defineProps({
    place: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
});
const placeName = ref();
const markerOptions = {
    position: {
        lat: 51.093048,
        lng: 6.842120
    }, title: 'Me'
}
const mapCenter = ref({ lat: 37.7749, lng: -122.4194 });

const onMapInit = (map) => {
    mapInstance = map;
  if (mapInstance) {
    placesService = new google.maps.places.PlacesService(mapInstance); // Initialize PlacesService
    console.log('PlacesService initialized successfully.');
  } else {
    console.error('Failed to initialize PlacesService: mapInstance is null.');
  }
};

const searchPlaces = () => {
    const query = document.getElementById('search-box').value; // Get the search query from the input
  if (!query) {
    alert('Please enter a search query.');
    return;
  }

  if (!placesService) {
    alert('PlacesService is not initialized. Ensure the map is loaded before searching.');
    console.error('PlacesService is null. Ensure the onMapInit callback is called.');
    return;
  }

  const request = {
    query, // Search query
    fields: ['name', 'geometry'], // Fields to retrieve
  };

  // Perform the search
  placesService.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      searchResults.value = results; // Update search results
      if (results[0]?.geometry?.location) {
        mapCenter.value = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        }; // Re-center the map to the first result
      }
    } else {
      alert('No places found for the given query.');
      searchResults.value = [];
    }
  });
   
};

onMounted(async () => {
    mapCenter.value.lat = props.latitude;
    mapCenter.value.lng = props.longitude;
    let map;
    let center;
    const { Map } = await google.maps.importLibrary("maps");
    center ={lat: props.latitude, lng: props.longitude }
    map = new Map(document.getElementById("map"), {
    center: center,
    zoom: 17,
    mapId: "d2d171d798eb4e54",
  });
    onMapInit(map);

})

// Initialize the Autocomplete feature when the component is mounted


</script>

<style scoped>
.vue-map-container {
    padding: 0 !important;
}
</style>