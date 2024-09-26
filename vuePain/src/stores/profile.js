import { defineStore } from "pinia";
import axios from 'axios';
import { ref } from "vue";
import router from '@/router';
import instance from "@/api";
import handleEndpoint from './handler.js';

export const useProfileStore = defineStore('profile',() =>{

    var profile = ref({});

    function doProfile(err,success,cls) { 
        /* I would do something here */
        console.log("OMGHERE");
        /* Put a guard here */
        profile = success.data.data;
        console.log("prof",profile);
    } 

    async function getProfile(params,callback,args) {
        console.log("goprofile");
        handleEndpoint(instance.get('/profile'),doProfile,null);
        console.log("Done with HE");
        
    }

    return { profile, getProfile }

})
