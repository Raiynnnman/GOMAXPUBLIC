<template>
   <Navbar @menuOpen="visible = true"></Navbar>
   <Drawer v-model:visible="visible">
      <template #header>
         <div>
            <img class="main-logo" src="./assets/svg/logo.svg">
         </div>
      </template>
      <PanelMenu :model="items" class="w-full md:w-80" />
   </Drawer>
   <RouterView></RouterView>
</template>





<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router'
import router from './router';
const visible = ref(false)

const items = ref([
   {
      label: 'Home',
      icon: 'pi pi-file',
      command: () => {
         router.push('/');
      },

   },
   {
      label: 'Family Tracker 360',
      icon: 'pi pi-cloud',
      items: [
         {
            label: 'Track friends and family',
            icon: 'pi pi-cloud-download',
            command: () => {
               router.push('/');
            },
         },
         {
            label: 'Curfew reminder',
            icon: 'pi pi-refresh'
         },
      ]
   },
]);



</script>
