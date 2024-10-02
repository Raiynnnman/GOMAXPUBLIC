<template>
    <div class="container-fluid bg-login pt-5">
        <div class="row justify-content-center h-100 align-content-center">
            <div class="col-12 col-md-4 col-lg-4">
                <Card class="login-container">
                    <template #content>
                        <div class="p-4">
                            <div class="d-flex justify-content-center">
                                <h1 class="text-white">Welcome</h1>
                            </div>
                            
                            <FloatLabel class="mt-4 w-auto">
                                <InputText class="w-100" id="username" v-model="email" />
                                <label for="username">Email</label>
                            </FloatLabel>
                            <FloatLabel class="mt-4">
                                <Password class="w-100" id="pass" v-model="password" toggleMask :feedback="false" />
                                <label for="pass">Password</label>
                            </FloatLabel>
                            <div class="d-flex justify-content-end my-3">
                                <a class="cursor-pointers" @click="resetDialog=true">Forgot password?</a>
                            </div> 
                            <Button class="mt-4 w-100 p-button-gradient" label="Login" @click="signIn()"></Button>
                            <div class="d-flex justify-content-center my-3">
                                <p>Or login using</p>
                            </div>
                            <div class="my-4 social-login justify-content-center">
                                <a><i class="fa-brands fa-google fa-2x"></i></a>
                                <a><i class="fa-brands fa-apple fa-2x"></i></a>
                                <a><i class="fa-brands fa-microsoft fa-2x"></i></a>
                            </div>
                            <div class="d-flex justify-content-center my-3">
                                <p>Don't have an account yet? <RouterLink :to="'/signup'"><strong> Join Max</strong> </RouterLink></p>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="resetDialog" modal header="Reset Password" :style="{ width: '25rem' }">
        <FloatLabel class="mt-4 w-auto">
            <InputText class="w-100" id="email" v-model="email" />
            <label for="email">Email</label>
        </FloatLabel>
        <div class="d-flex justify-content-center my-3">
            <Button class="mt-4 w-50" label="Reset"></Button>
        </div>
    </Dialog>
</template>
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';
const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const resetDialog = ref(false);

if (localStorage.getItem("token")) { 
    router.push("/dashboard");
} 
const signIn = () => {
    authStore.login2({ email: email.value, password: password.value});
}


</script>

<style scoped>
.container-fluid {

  background-color: #303030;
}

.login-container {
    background-color: rgba(36, 36, 36, 0.7) !important;
    backdrop-filter: blur(5px);
    color: #fff !important;
    border: 5px solid #f97316;
    border-radius: 30px;
   
}

.social-login {
    display: grid;
    grid-template-columns: 30% 30% 30px;
    gap: 5%;
}
</style>
