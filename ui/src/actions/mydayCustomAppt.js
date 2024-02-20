import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import Cookies from 'universal-cookie';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';
const cookies = new Cookies();

export const RECEIVED_CAPPT_DATA_SUCCESS = 'RECEIVED_CAPPT_DATA_SUCCESS';
export const RECEIVING_CAPPT_DATA = 'RECEIVING_CAPPT_DATA';

// export function receiveDataRequest(params) {
//     return (dispatch) => {
//         dispatch(receivingData(params)).then(data => {
//             dispatch(receiveDataSuccess(data));
//         });
//     };
// }

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_CAPPT_DATA_SUCCESS,
        payload
    }
}

export function saveCustomAppt(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_CAPPT_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/myday/custom/appointment',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_CAPPT_DATA_SUCCESS,
                payload: e.data.data
            });
            if (callback) { 
              if (!e.data.data.success) { 
                  callback(e.data.data,args); 
              } else { 
                  callback(null,args); 
              } 
            } 
      })
      .catch((e) => { 
        handleError(e,callback,args);
      })
      .finally(() => { 
      });
    }
}