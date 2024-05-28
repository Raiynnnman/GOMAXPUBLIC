import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_REGVER_DATA_SUCCESS = 'RECEIVED_REGVER_DATA_SUCCESS';
export const RECEIVING_REGVER_DATA = 'RECEIVING_REGVER_DATA';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_REGVER_DATA_SUCCESS,
        payload
    }
}

export function registerVerify(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_REGVER_DATA
    });
    const response = await axios.create({ //eslint-disable-line no-unused-vars
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/registration/verify',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_REGVER_DATA_SUCCESS,
                payload: e.data.data
            });
          if (callback) {
            if (!e.data.data.success) {
                callback(e.data.data,args);
            } else {
                callback(null,args,e.data.data);
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




