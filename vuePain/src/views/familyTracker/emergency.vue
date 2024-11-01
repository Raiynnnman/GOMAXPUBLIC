<template>
    <div class="tab">
        <div class="text-center border-bottom">
            <h3>Emergency</h3>
        </div>
        <h4>Emergency Contacts</h4>
        <EmergencyContacts/>
        <h4 class="d-block">S.O.S</h4>
        <div class="row w-100 pt-3 justify-content-center g-0">
            <div class="col-8 d-flex justify-content-center">
                <Button class="SOSButton mt-2" v-if="!timerStarted" label="S.O.S" severity="warn"
                    aria-label="Notification" @click="startCountdown" />
                <Knob v-else v-model="countdown" :min="0" :max="10" :size="200" range-color="#272727 " />

            </div>
        </div>
        <div class="row w-100 pt-3 justify-content-center g-0">
            <div class="col-8 py-2 d-flex justify-content-center">
                <Button v-if="timerStarted" class="p-button-gradient" label="Send S.O.S Now" @click="startEmergencyProtocol"></Button>
            </div>
            <div class="col-8 py-2 d-flex justify-content-center">
                <Button v-if="timerStarted" class="p-button-outline" label="Cancel" @click="cancelCountdown"></Button>
            </div>
        </div>
    </div>

</template>
<script setup>

import { ref } from 'vue';

const countdown = ref(10)
const timerStarted = ref(false);
let interval = null

const startCountdown = () => {
    timerStarted.value = true;
    interval = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--
            if (countdown.value <= 0) {
                startEmergencyProtocol();
            }
        } else {
            clearInterval(interval)
        }
    }, 1000)
}

const cancelCountdown = () => {
    timerStarted.value = false;
    clearInterval(interval)
    countdown.value = 10
}

const startEmergencyProtocol = () => {
    console.log('Calling... 911');
    window.location.href = "tel:911";
}



</script>
<style scoped>
.tab {
    width: 100% !important;
    height: 100vh !important;
    padding: 1rem;
}


</style>