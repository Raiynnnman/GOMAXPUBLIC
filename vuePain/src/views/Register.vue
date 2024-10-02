<template>
    <div class="container-fluid bg-login pt-5">
        <div class="row justify-content-center h-100 align-content-center">
            <div class="col-12 col-md-4 col-lg-4">
                <Card class="login-container">
                    <template #content>

                        <div class="p-4">
                            <div class="d-flex justify-content-center">
                                <h1>Create an account</h1>
                            </div>
                            <div class="d-flex justify-content-center">
                                <SelectButton @change="customerType" v-model="registrationType" :options="options"
                                    aria-labelledby="basic" />
                            </div>
                            <FloatLabel class="mt-5 w-auto">
                                <InputText class="w-100" id="firstName" v-model="email" />
                                <label for="firstName">First Name</label>
                            </FloatLabel>
                            <FloatLabel class="mt-5 w-auto">
                                <InputText class="w-100" id="lastName" v-model="email" />
                                <label for="lastName">Last Name</label>
                            </FloatLabel>
                            <FloatLabel class="mt-5 w-auto">
                                <InputText class="w-100" id="email" v-model="email" />
                                <label for="email">Email</label>
                            </FloatLabel>
                            <FloatLabel class="mt-5">
                                <Password class="w-100" id="password" v-model="password" toggleMask />
                                <label for="password">Password</label>
                            </FloatLabel>
                            <FloatLabel class="mt-5">
                                <Password class="w-100" id="repPassword" v-model="password" toggleMask />
                                <label for="repPassword">Repeat Password</label>
                            </FloatLabel>
                            <FloatLabel class="mt-5">
                                <label for="phone">Phone</label>
                                <InputMask id="phone" v-model="value2" mask="(999) 999-9999"
                                    placeholder="(999) 999-9999" fluid />
                            </FloatLabel>

                            <Button class="mt-5 w-100 p-button-gradient" label="Register" @click="signUp()"></Button>

                            <div class="d-flex justify-content-center my-3">
                                <p>Already have an account? <RouterLink :to="'/login'"><strong> Login</strong>
                                    </RouterLink>
                                </p>
                            </div>
                        </div>

                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';
const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const resetDialog = ref(false);
const registrationType = ref('Customer');
const clientType = ref('Customer')
const options = ref(['Customer', 'Legal', 'Provider']);
const signIn = () => {
    authStore.login({ email: email.value, password: password.value });
    if (authStore.isLoggedIn) {
        router.push('/dashboard');
    }
}

onMounted(() => {
    console.log(clientType.value);
})

const customerType = (event) => {
    clientType.value = event.value;
    if (clientType.value === 'Provider') {
        router.push('/plans');
    }
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