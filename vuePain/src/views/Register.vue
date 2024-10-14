<template>
    <div class="container-fluid bg-login">
        <!-- <div class="row justify-content-center h-100 align-content-center">
            <div class="col-12 ">
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
                            <div class="mt-5 w-auto">
                                <InputText class="w-100" id="firstName" v-model="email" />
                                <label for="firstName">First Name</label>
                            </div>
                            <div class="mt-5 w-auto">
                                <InputText class="w-100" id="lastName" v-model="lastName" />
                                <label for="lastName">Last Name</label>
                            </div>
                            <div class="mt-5 w-auto">
                                <InputText class="w-100" id="email" v-model="email" />
                                <label for="email">Email</label>
                            </div>
                            <div class="mt-5">
                                <Password class="w-100" id="password" v-model="password" toggleMask />
                                <label for="password">Password</label>
                            </div>
                            <div class="mt-5">
                                <Password class="w-100" id="repPassword" v-model="password" toggleMask />
                                <label for="repPassword">Repeat Password</label>
                            </div>
                            <div class="mt-5">
                                <label for="phone">Phone</label>
                                <InputMask id="phone" v-model="value2" mask="(999) 999-9999"
                                    placeholder="(999) 999-9999" fluid />
                            </div>

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
</div> -->
        <Stepper v-model:value="activeStep" class="h-100">

            <StepPanels class="h-100">
                <StepPanel class="h-100" v-slot="{ activateCallback }" :value="1">
                    <div class="row  h-100 justify-content-center  align-content-center">
                        <div class="col-12 ">
                            <div class="login-container">
                                <h1 class="text-center mt-4 mb-4 text-xl font-semibold">Let's get started</h1>
                                <h2 class="text-center mt-4 mb-4 text-xl font-semibold">What is your name?</h2>
                                <div class="mt-5 w-auto">
                                    <InputText @input="validateStep(1)" placeholder="First Name" class="w-100 p-input-normal"
                                        id="firstName" v-model="firstName" />

                                </div>
                                <div class="mt-5 w-auto">
                                    <InputText @input="validateStep(1)" placeholder="Last Name" class="w-100 p-input-normal"
                                        id="lastName" v-model="lastName" />
                                </div>
                                <div class="mt-5 text-center">
                                    <small>By signing up you agree to our <RouterLink>Privacy Policy</RouterLink> and
                                        <RouterLink>Terms of Service.</RouterLink>
                                    </small>
                                </div>
                                <Button :disabled="step1" class="mt-5 w-100 p-button-gradient" label="Continue"
                                    @click="activateCallback(2)"></Button>
                            </div>

                        </div>
                    </div>
                </StepPanel>
                <StepPanel class="h-100" v-slot="{ activateCallback }" :value="2">
                    <div class="row  h-100 justify-content-center  align-content-center">
                        <div class="col-12 ">
                            <div class="login-container">
                                <h2 class="text-center mt-4 mb-4 text-xl font-semibold">
                                    What is
                                    your email?</h2>

                                <div class="mt-5 w-auto">
                                    <InputText @input="validateStep(2)" placeholder="Email" class="w-100 p-input-normal" id="email"
                                        v-model="email" />

                                </div>

                                <Button :disabled="step2" class="mt-5 w-100 p-button-gradient" label="Continue"
                                    @click="activateCallback(3)"></Button>
                            </div>

                        </div>
                    </div>
                </StepPanel>
                <StepPanel class="h-100" v-slot="{ activateCallback }" :value="3">
                    <div class="row  h-100 justify-content-center  align-content-center">
                        <div class="col-12 ">
                            <div class="login-container">
                                <h2 class="text-center mt-4 mb-4 text-xl font-semibold">
                                    What is
                                    your phone number?</h2>
                                <h3 class="text-center mt-4 mb-4 text-xl font-semibold"><span class="fi fi-us"></span>
                                    +1</h3>

                                <div class="mt-5">

                                    <InputMask class="p-input-normal" @keypress="validateStep(3)" id="phone" v-model="telephone"
                                        mask="(999) 999-9999" placeholder="(999) 999-9999" fluid />
                                </div>

                                <Button :disabled="step3" class="mt-5 w-100 p-button-gradient" label="Continue"
                                    @click="activateCallback(4)"></Button>
                            </div>

                        </div>
                    </div>
                </StepPanel>
                <StepPanel class="h-100" v-slot="{ activateCallback }" :value="4">
                    <div class="row  h-100 justify-content-center  align-content-center">
                        <div class="col-12 ">
                            <div class="login-container">
                                <h2 class="text-center mt-4 mb-4 text-xl font-semibold">
                                    Create your Password</h2>
                                <div class="mt-5">
                                    <Password @input="validateStep(4)" placeholder="Password" class="w-100"
                                        id="password" v-model="password" toggleMask />

                                </div>
                                <h2 class="text-center mt-4 mb-4 text-xl font-semibold">
                                    Confirm your Password</h2>
                                <div class="mt-5">
                                    <Password @input="validateStep(4)" placeholder="Password" class="w-100"
                                        id="repPassword" v-model="repPassword" toggleMask :feedback="false" />

                                </div>
                                <div class="mt-5 text-center">
                                    <i>Tip: To make a strong password combine uppercase letters, lowercase letters,
                                        numbers, and
                                        symbols. </i>
                                </div>


                                <Button :disabled="step4" class="mt-5 w-100 p-button-gradient" label="Create Account"
                                    @click="createAccount"></Button>
                            </div>

                        </div>
                    </div>
                </StepPanel>
                <StepPanel class="h-100" v-slot="{ activateCallback }" :value="5">
                    <div class="row  h-100 justify-content-center  align-content-center">
                        <div class="col-12 ">
                            <div class="login-container">
                                <h2 class="text-center mt-4 mb-4 text-xl font-semibold">
                                    Account Successfully Created!</h2>
                                    <div class="mt-5 text-center">
                                        <img class="dummy-register" src="../assets/svg/dummy.svg" alt="dummy">
                                    </div>   

                                <Button :disabled="step4" class="mt-5 w-100 p-button-gradient" label="Finish"
                                    @click="router.push('/login')"></Button>
                            </div>

                        </div>
                    </div>
                </StepPanel>
            </StepPanels>
        </Stepper>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';
const email = ref('');
const password = ref('');
const repPassword = ref('');
const authStore = useAuthStore();
const registrationType = ref('Customer');
const clientType = ref('Customer')
const options = ref(['Customer', 'Legal', 'Provider']);
const activeStep = ref(1);
const completed = ref(false);
const firstName = ref();
const lastName = ref();
const telephone = ref();
const step1 = ref(true);
const step2 = ref(true);
const step3 = ref(true);
const step4 = ref(true);

onMounted(() => {
    console.log(clientType.value);
})

const validateStep = (step) => {
    console.log('Hola');
    switch (step) {
        case 1: if (firstName.value.length === 0 || lastName.value.length === 0) {
            step1.value = true;
        }
        else {
            step1.value = false;
        }

            break;
        case 2: if (email.value.length === 0) {
            step2.value = true;
        }
        else {
            step2.value = false;
        }

            break;
        case 3: if (telephone.value.length <= 9 || telephone.value.length === 0) {
            step3.value = true;
        }
        else {
            step3.value = false;
        }

            break;
        case 4: if (password.value.length === 0 || repPassword.value.length === 0) {
            step4.value = true;
        }
        else {
            if (password.value !== repPassword.value) {
                step4.value = true;
            }
            else {
                step4.value = false;
            }

        }

            break;
        default:
            break;
    }
}

const createAccount = () => {
    activeStep.value = 5;
}

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

    color: #fff !important;
    height: auto !important;

}


.social-login {
    display: grid;
    grid-template-columns: 30% 30% 30px;
    gap: 5%;
}

input:focus {
    outline: none !important;
}

.dummy-register{
    height: 200px;
    width: auto;
}
</style>