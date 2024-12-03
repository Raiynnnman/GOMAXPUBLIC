<template>
    <div class="tab">
        <div class="text-center border-bottom">
            <h3>Places</h3>
        </div>

        <div class="row d-grid w-100 h-80 pt-3 justify-content-center align-items-center g-0">
            <div class="col-12 text-center">

                <Message severity="contrast" class="mb-4">
                    <template #icon>
                        <i class="fa-solid fa-circle-info"></i>
                    </template>

                    <span class="ml-2"> Add places to get notified when circle members enter or leave the place</span>
                   
                </Message>
                <div class="common-places py-4">
                    <a class="place-item" @click="openDrawer('Home')" >
                        <i class="contact-icon fa-solid fa-circle-plus fa-lg"></i>
                        <small class="text-left">Home</small>
                    </a>
                    <a class="place-item" @click="openDrawer('Work')" >
                        <i class="contact-icon fa-solid fa-circle-plus fa-lg"></i>
                        <small class="text-left">Work</small>
                    </a>
                    <a class="place-item" @click="openDrawer('School')" >
                        <i class="contact-icon fa-solid fa-circle-plus fa-lg"></i>
                        <small class="text-left">School</small>
                    </a>
                    
                </div>
                <Divider align="center">
                                <b>OR</b>
                </Divider>
                <Button class="p-button-gradient mt-4" label="Add other place" @click="openDrawer('')" />
            </div>
        </div>

    <Drawer v-model:visible="visible" position="full" header="Find a Place">
        <PlacesSidebar :place="placeName" :latitude="placeLat" :longitude="placeLng"></PlacesSidebar>
    </Drawer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PlacesSidebar from './placesSidebar.vue';


const visible=ref(false);
const placeName=ref();
const placeIcon=ref();
const placeNotification=ref();
const placeLat=ref();
const placeLng=ref();

const openDrawer = (Name) => {
    placeName.value=Name.value;
    visible.value=true;
}

const setMarker = async () => {
  try {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    // Wrap navigator.geolocation in a Promise
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    // Log position for debugging
    console.log("User's current location: ", { latitude, longitude });

    // Check if markers array has at least one marker
    //if (markers.value[0]) {

    // Update the first marker's position
    placeLat.value = latitude;
    placeLng.value = longitude;

    /*  } else {
       console.error("Marker is undefined, cannot update position.");
     } */

  } catch (error) {
    console.error("Error fetching location:", error);
  }
}

onMounted(() => {

  setMarker();
})

</script>

<style scoped>
.tab {
    width: 100% !important;
    height: 100vh !important;
    padding: 1rem;
    background-color: #222222;
    color: #fff;
}

.common-places {

display: grid;
grid-template-columns: 31.5% 31.5% 31.5% ;
gap: 2.5%;
}
.place-item {
    display: grid;
    grid-template-columns: 25% 50%;
    justify-content: center;
    align-items: center;
    border: 2px solid #f97316;
    width: 100%;
    height: 80px;
    border-radius: 10px;
    font-weight: bold;
}



</style>