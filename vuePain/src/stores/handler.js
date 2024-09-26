
import handleError from './handleError';

async function handleEndpoint(func,callback,args) { 

    try { 
        await func.then((e) => { 
            console.log("e",e);
            console.log("cb",callback);
            if (callback) { 
                callback(null,e,args);
            } 
        }).catch((e) => { 
            console.log("catch_e",e);
            if (callback) { 
                callback(e,null,args);
            }
        }).finally(() => { 
            /* Do something fancy here */
        });
    } catch (err) { 
        console.log("out_catch",err);
        handleError(err); /* 50?, 40?, etc */
    } 

} 

export default handleEndpoint;
