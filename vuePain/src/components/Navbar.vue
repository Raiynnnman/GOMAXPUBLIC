<template>
<Toolbar>
    <template #start>
        <Button text @click="$emit('menuOpen')"><i class="fa-solid fa-bars"></i></Button>
        <img class="main-logo" src="../assets/svg/logo.svg" @click="$router.push('/')">
    </template>

    <template #center>
        
    </template>

    <template #end> 
        <!-- <Avatar label="PM" class="mr-2 avatar" shape="circle" /> -->
         <Button class="p-button-gradient me-lg-3" @click="$router.push('/login')" >Login Max</Button>
    </template>
</Toolbar>
</template>
<script setup>
import router from '@/router';

</script>

<style>
    .avatar{
        background-color: #363636 !important;
        color: #f97316;
    }
</style>