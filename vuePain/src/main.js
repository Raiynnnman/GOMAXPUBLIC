import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Lara from '@primevue/themes/lara';
import App from './App.vue'
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import router from './router'

//PrimeVue components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Dialog from 'primevue/dialog';
import SelectButton from 'primevue/selectbutton';
import Toolbar from 'primevue/toolbar';
import Navbar from './components/Navbar.vue';
import Avatar from 'primevue/avatar';
import Drawer from 'primevue/drawer';
import PanelMenu from 'primevue/panelmenu';
import InputMask from 'primevue/inputmask';




const MyPreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '{orange.50}',
            100: '{orange.100}',
            200: '{orange.200}',
            300: '{orange.300}',
            400: '{orange.400}',
            500: '{orange.500}',
            600: '{orange.600}',
            700: '{orange.700}',
            800: '{orange.800}',
            900: '{orange.900}',
            950: '{orange.950}'
        }
    }
});
const app = createApp(App)
//PrimeVue Components
app.component('Button', Button);
app.component('Card', Card);
app.component('Password', Password);
app.component('InputText', InputText);
app.component('FloatLabel', FloatLabel);
app.component('Dialog', Dialog);
app.component('SelectButton', SelectButton);
app.component('Toolbar', Toolbar);
app.component('Avatar', Avatar);
app.component('Drawer', Drawer);
app.component('PanelMenu', PanelMenu);
app.component('InputMask', InputMask);



//Custom Components
app.component('Navbar', Navbar);

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            prefix: 'p',
            darkModeSelector: 'dark',
            cssLayer: false
        }
    }
});
app.use(createPinia())
app.use(router)

const profileStore = useProfileStore();
const authStore = useAuthStore();
if (localStorage.getItem("token")) { 
    profileStore.getProfile({},null,null);
}


app.mount('#app')
