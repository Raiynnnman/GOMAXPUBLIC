<template>
    <a v-if="isEmpty" class="contact-item-empty" @click="pickContact">
        <i class="contact-icon fa-solid fa-circle-plus fa-2x"></i>
    </a>
    <div v-else >
        <div v-if="contact" class="contact-item p-2" @click="">
            <small><i class="fa-solid fa-user fa-sm"></i> {{ contact.name[0] || 'No Name' }}</small>
            <small><i class="fa-solid fa-phone fa-sm"></i> {{ contact.tel ? contact.tel[0] : 'No Phone' }} </small>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
const isEmpty=ref(true)
const toast = useToast();
const contact = ref()

async function pickContact() {
  if (!('contacts' in navigator) || !('ContactsManager' in window)) {
    alert('Contact Picker API not supported on this device or browser.')
    return
  }

  try {
    const properties = ['name', 'tel'] // Specify the contact properties you need
    const options = { multiple: false } // Restrict to a single contact

    const [selectedContact] = await navigator.contacts.select(properties, options);
    isEmpty.value = false;
    contact.value = selectedContact;
   
  } catch (error) {
    isEmpty.value = true;
    console.error('Error picking contact:', error)
  }
}


</script>

<style scoped>
.contact-item-empty {
    display: grid;
    border: 2px solid #f97316;
    width: 100%;
    height: 80px;
    border-radius: 10px;
}

.contact-item{
    display: grid;
    border: 2px solid #f97316;
    width: 100%;
    height: 80px;
    border-radius: 10px;
}

small{
    color: #f97316;
    font-weight: 500;
}

.contact-icon {
    align-self: center !important;
    justify-self: center !important;
    color: #f97316;
}

.contact-item-empty :active {
    display: grid;
    width: 100%;
    height: 100%;
    background: #f97316;
}
</style>