<template>
  <div class="container-fluid m-0  p-0 pb-5">
    <div class="cover">
      <div class="cover-text">
        <h1>A <span class="orange-text">Friend</span> When you need One</h1>
        <p>We put the control back in your hands.  Your personal advocate.</p>
      </div>
    </div>
    <div class="d-flex justify-content-center">
      <div class="text-center text-white">
        <h1 class="font-bold">America's <span class="orange-text">Largest</span> Personal Injury Platform</h1>
       
      </div>
    </div>
    <div class="row px-4 pb-5">

    </div>
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

<style scoped>
.container-fluid {

  background-color: #303030;
}

.cover {

  background-image: url('../assets/img/map.webp') !important;
  background-size: cover;
  background-repeat: no-repeat;
  height: 500px;
  color: #fff !important;
  text-align: center;

}

.cover-text {
  position: absolute;
  background-color: rgba(36, 36, 36, 0.5) !important;
  backdrop-filter: blur(5px) !important;
  top: 15%;

}

.plan-card {
  background-color: rgba(36, 36, 36, 0.7) !important;
  backdrop-filter: blur(5px);
  color: #fff !important;
  border: 5px solid #f97316;
  border-radius: 30px;
  height: 500px;


}

h1 {
  font-weight: 700;

}

.plan-card-h3 {
  font-weight: bold;
  font-family: "Fira Sans", sans-serif;
  color: #f97316;
  text-transform: uppercase;
}

.plan-list {
  text-align: left;
  list-style-type: none;
}

.plan-list>li {
  margin: 1rem 0;
}

.plan-list>li>.fa-solid {
  color: #f97316;
}

.subs-button {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: "Fira Sans", sans-serif;
  line-height: 1.3rem;
}

br {}

small {
  font-size: .9rem;
  font-weight: 500;
  font-family: "Fira Sans", sans-serif;
}
</style>