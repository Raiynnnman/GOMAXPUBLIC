<template>
  <div class="card flex justify-center">
      <Button label="Login" @click="login()"></Button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import router from "@/router";


const login = () => {
  router.push('/login');
}


 




</script>

