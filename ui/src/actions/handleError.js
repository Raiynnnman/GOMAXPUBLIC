
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiBaseUrl } from '../globalConfig';

export const handleError = function(er,callback,args) { 
    if (er.constructor == Object) {
        console.log("er",JSON.stringify(er));
    } else { 
        console.log(er);
    } 
    if (!er) { return; }
    if (!er.response) { return; }
    if (er.response.status === 401 || er.response.status === 403) {
        localStorage.removeItem("authorization");
        localStorage.removeItem("token");
        localStorage.removeItem("CONTEXT");
        if (!window.location.toString().includes("login")) { 
            if (!window.location.toString().includes("password")) { 
                window.location = "/index.html?login=true";
            }
        } 
    } else { 
        if (!callback) { 
          toast.error('Something has gone wrong. Please contact support. ',
            {
                position:"top-right",
                autoClose:3000,
                hideProgressBar:true
            }
          );
        } else { 
            callback(er,args)
        } 
    }
    //if (er.response.status >= 500 && er.response.status < 600) { 
    //    throw new Error();
    //}
}


export default handleError;
