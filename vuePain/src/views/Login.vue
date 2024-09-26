<template>
    <div class="container-fluid bg-login pt-5">
        <div class="row justify-content-center h-100 align-content-center">
            <div class="col-4">
                <Card class="login-container">
                    <template #content>
                        <h1>Max Pain</h1>
                        <h3>Sign In</h3>
                        <FloatLabel class="mt-4 w-auto">
                            <InputText class="w-100" id="username" v-model="email" />
                            <label for="username">Email</label>
                        </FloatLabel>
                        <FloatLabel class="mt-4">
                            <Password class="w-100" id="password"v-model="password" toggleMask :feedback="false"/>
                                <label for="password">Password</label>
                        </FloatLabel>
                        <div class="d-flex justify-content-end">
                            <Button class="mt-4" label="Sign In" @click="signIn()" ></Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';
const email = ref('');
const password = ref('');
const authStore = useAuthStore();

if (localStorage.getItem("token")) { 
    router.push("/dashboard");
} 
const signIn = () => {
    authStore.login2({ email: email.value, password: password.value});
}


</script>

<style>
.bg-login {
    background-image: url('../assets/img/Pound.webp');
    background-size: cover;
    background-repeat: no-repeat;
}

.login-container {
    background-color: rgba(255, 255, 255, 0.692) !important;
    backdrop-filter: blur(5px);
  
}
</style>
