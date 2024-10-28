<template>
  <div v-if="firstTimeRun" class="container-fluid">
    <div class="row p-4 justify-content-center">
      <h2 class="text-center mt-4 mb-4 text-xl font-semibold">Want to join a family group? Enter your invite code</h2>
      <div class="col-12 col-lg-4">
        <div class="d-flex justify-content-center ">
          <InputOtp @input="validateInput" v-model="familyCode" integerOnly :length="6" />
        </div>
        <div class="mt-5 text-center">
          <i>Tip: You may need to request the code for the family group to the creator</i>
        </div>
        <div class="mt-5 text-center">
          <Button :disabled="!verifyButton" class="mt-5 w-100 p-button-gradient" label="Validate Code"
            @click="validateCode"></Button>
        </div>
        <Divider align="center">
          <b>OR</b>
        </Divider>
      </div>
    </div>

    <div class="row px-4 pt-1 justify-content-center">
      <h2 class="text-center mt-4 mb-4 text-xl font-semibold">Do you want to create a family group instead?</h2>
      <div class="col-12 col-lg-4">

        <div class="mt-5 text-center">
          <p>A code to share your family group will be created</p>
        </div>
        <div class="mt-2 text-center">
          <Button class="mt-5 w-100 p-button-gradient" label="Create a new Group" @click="visible = true"></Button>
        </div>
      </div>
    </div>
    <Toast position="top-center" />
  </div>
  <div class="container-fluid" v-else>
    <div class="row justify-content-center p-0">
      <Tabs value="0" class="p-0">
        <TabList>
          <Tab value="0" as="div" class="flex justify-content-center text-center">
            <i class="fa-solid fa-map-location-dot"></i><br>
            <small>Home</small>
          </Tab>
          <Tab value="1" as="div" class="flex justify-content-center text-center">
            <i class="fa-solid fa-truck-medical"></i><br>
            <small>Emergency</small>
          </Tab>
          <Tab value="2" as="div" class="flex justify-content-center text-center">
            <i class="fa-solid fa-location-dot"></i><br>
            <small>Places</small>
          </Tab>
        </TabList>
        <TabPanels class="p-0">
          <TabPanel value="0" as="p" class="m-0 p-0">
            <GMapMap :center="{ lat: userLat, lng: userLng }" :zoom="17" map-type-id="roadmap"
              style="width: 100vw; height: 100vh" :options="{
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                fullscreenControl: true
              }">
              <GMapMarker :key="index" v-for="(m, index) in markers" :position="m.position" :clickable="true"
                :draggable="true" />
            </GMapMap>
          </TabPanel>
          <TabPanel value="1" as="p" class="m-0">

          </TabPanel>
          <TabPanel value="2" as="p" class="m-0">

          </TabPanel>
        </TabPanels>
      </Tabs>




    </div>

  </div>
  <Drawer v-model:visible="visible" position="right">
    <template #header>
      <h2>Create a new Family group</h2>
    </template>
    <Stepper v-model:value="activeStep" class="h-100">

      <StepPanels class="h-100">
        <StepPanel class="h-100" v-slot="{ activateCallback }" :value="1">
          <div class="row  h-100 justify-content-center  align-content-center">
            <div class="col-12 h-100">
              <div class="stepper-container w-100">
                <h3>Give your Family group a name</h3>
                <InputText @input="validateStep(1)" placeholder="Group name" class="w-100 p-input-normal" id="firstName"
                  v-model="groupName" />
                <Button :disabled="step1" class="mt-5 w-100 p-button-gradient " label="Continue"
                  @click="activateCallback(2)"></Button>
              </div>

            </div>
          </div>
        </StepPanel>
        <StepPanel class="h-100" v-slot="{ activateCallback }" :value="2">
          <div class="row  h-100 justify-content-center  align-content-center">
            <div class="col-12 h-100">
              <div class="stepper-container w-100">
                <h3>Share this Code to your family</h3>
                <div class="code-container text-center p-4">
                  <h1>{{ code }}</h1>
                </div>
                <Button class="mt-5 w-100" outlined rounded label="Share code" @click="shareCode"></Button>
                <Button class="mt-5 w-100 p-button-gradient " label="Continue" @click="activateCallback(3)"></Button>
              </div>
            </div>
          </div>
        </StepPanel>
        <StepPanel class="h-100" v-slot="{ activateCallback }" :value="3">
          <div class="row  h-100 justify-content-center  align-content-center">
            <div class="col-12 h-100">
              <div class="stepper-container w-100">
                <h3>What is your role in this Family group?</h3>
                <Button class="mb-2 mt-5 w-100" outlined rounded label="Mom" @click="setRole('')"></Button>
                <Button class="my-2 w-100" outlined rounded label="Dad" @click="setRole('')"></Button>
                <Button class="my-2 w-100" outlined rounded label="Son/ Daughter/ Child" @click="setRole('')"></Button>
                <Button class="my-2 w-100" outlined rounded label="Gradparent" @click="setRole('')"></Button>
                <Button class="my-2 w-100" outlined rounded label="Partner/ Spouse" @click="setRole('')"></Button>
                <Button class="my-2 w-100" outlined rounded label="Friend" @click="setRole('')"></Button>
                <Button class="my-2 w-100" outlined rounded label="Other" @click="otherOption = true"></Button>
                <InputText v-if="otherOption" placeholder="Enter your role" class="w-100 my-2 p-input-normal"
                  id="otherRole" v-model="otherRole" />
                <Button v-if="otherRole" class="mt-5 w-100 p-button-gradient " label="Continue"
                  @click="activateCallback(4)"></Button>
              </div>
            </div>
          </div>
        </StepPanel>
        <StepPanel class="h-100" v-slot="{ activateCallback }" :value="4">
          <div class="row  h-100 justify-content-center  align-content-center">
            <div class="col-12 h-100">
              <div class="stepper-container w-100 text-center">
                <h3>Add your photo</h3>
                <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary"
                  class="mt-5 p-button-gradient " />
                <Avatar v-if="src" :image="src" class="m-5" size="xlarge" shape="circle" />

                <Button :disabled="!src" class="mt-5 w-100 p-button-gradient " label="Continue"
                  @click="activateCallback(5)"></Button>
              </div>
            </div>
          </div>
        </StepPanel>
        <StepPanel class="h-100" v-slot="{ activateCallback }" :value="5">
          <div class="row  h-100 justify-content-center  align-content-center">
            <div class="col-12 h-100">

            </div>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Drawer>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useShare } from '@vueuse/core'



const shareOptions = ref();
const visible = ref(false)
const toast = useToast();
const familyCode = ref();
const verifyButton = ref(false);
const firstTimeRun = ref(false);
const activeStep = ref(1);
const groupName = ref();
const step1 = ref(true);
const step2 = ref(true);
const step3 = ref(true);
const code = ref('FRE434');
const otherOption = ref(false);
const familyrole = ref();
const otherRole = ref();
const { share, isSupported } = useShare()
const userLat = ref();
const userLng = ref();

const markers = ref([
  {
    id: 1,
    position: {
      lat: 51.093048,
      lng: 6.842120
    }
  }
]);

const src = ref(null);


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
    if (markers.value[0]) {
      console.log("Marker exists, updating position...");
      // Update the first marker's position
      userLat.value = latitude;
      userLng.value = longitude;
      markers.value[0].position.lat = latitude;
      markers.value[0].position.lng = longitude;
    } else {
      console.error("Marker is undefined, cannot update position.");
    }

  } catch (error) {
    console.error("Error fetching location:", error);
  }
}

onMounted(() => {

  setMarker();
})


const onFileSelect = (event) => {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    src.value = e.target.result;
  };

  reader.readAsDataURL(file);
}


const validateInput = () => {
  if (familyCode.value.length === 6) {
    verifyButton.value = true;
  }
}

const validateCode = () => {
  toast.add({ severity: 'warn', summary: 'Error', detail: 'Code is not Valid', life: 3000 });
}

const validateStep = (step) => {
  console.log('Hola');
  switch (step) {
    case 1: if (groupName.value.length === 0) {
      step1.value = true;
    }
    else {
      step1.value = false;
    }

      break;
    case 2: if (email.value.length === 0) {
      step2.value = true;
    }
    else {
      step2.value = false;
    }

      break;
    case 3: if (telephone.value.length <= 9 || telephone.value.length === 0) {
      step3.value = true;
    }
    else {
      step3.value = false;
    }

      break;
    case 4: if (password.value.length === 0 || repPassword.value.length === 0) {
      step4.value = true;
    }
    else {
      if (password.value !== repPassword.value) {
        step4.value = true;
      }
      else {
        step4.value = false;
      }

    }

      break;
    default:
      break;
  }
}

const setRole = (role) => {
  familyrole.value = role;
  activeStep.value = 4;
}

const shareCode = () => {
  share({
    title: 'Max Pain join my Family group',
    text: 'Your Family Code is:' + code.value,
  })
}

</script>


<style scoped>
.container-fluid {

  background-color: #303030;
  padding-top: 4rem;
  color: #fff;
}

.stepper-container {
  color: #fff !important;
  height: 100% !important;
}

.code-container {
  border: 1px solid white;
  border-radius: 30px;
}

.vue-map-container {
  padding: 0 !important;
}
</style>