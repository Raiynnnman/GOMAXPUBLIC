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
         visible.value = false;
      },

   },
   {
      label: 'Family Tracker',
      command: () => {
         router.push('/maxTracker');
         visible.value = false;
      },
   },
]);



</script>
