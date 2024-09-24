import { defineStore } from "pinia";
import { ref } from "vue";
import instance from "@/api";
export const useAuthStore = defineStore('auth',() =>{
    const isLoggedIn = ref(false);
    const error = ref('');

    async function login(credentials){
        try {
            const response = await instance.post('/login',credentials);
            isLoggedIn.value=true;
            
        }
        catch(err){
            isLoggedIn.value=false;
            error.value = err.message || 'Login failed'; 
        }
    }

    return { isLoggedIn, error, login };
});