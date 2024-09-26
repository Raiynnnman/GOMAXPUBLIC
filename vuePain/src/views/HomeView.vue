<template>
  <div class="card flex justify-center">
    <h1>ZOMG</h1>
      <Button label="Login" @click="login()"></Button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import router from "@/router";

if (localStorage.getItem("token")) { 
    router.push("/dashboard");
} 

const login = () => {
  router.push('/login');
}

</script>

