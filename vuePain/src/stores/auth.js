import { defineStore } from "pinia";
import axios from 'axios';
import { ref } from "vue";
import router from '@/router';
import instance from "@/api";
import handleEndpoint from './handler.js';

export const useAuthStore = defineStore('auth',() =>{
    const isLoggedIn = ref(false);
    const error = ref('');

    function doLogin(err,success,cls) { 
        console.log("doLogin",err,success);
        if (err) { 
            /* Handle the error on the page */
            isLoggedIn.value = false;
            error.value = err.message || 'Login failed';
        } else { 
            /* Success! Log em in! */
            isLoggedIn.value = true;
            var tok = success.data.data.token;
            localStorage.setItem('token', tok);
            axios.defaults.headers.common['Authorization'] = "Bearer " + tok;
            router.push('/dashboard');
        } 
    } 

    async function login(credentials,callback,args) {

        await handleEndpoint(instance.post('/login',credentials),doLogin,null);
        console.log("Done with HE");
        
    }

    return { isLoggedIn, error, login };
});
