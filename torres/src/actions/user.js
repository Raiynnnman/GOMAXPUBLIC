import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_USER_DATA_SUCCESS = 'RECEIVED_USER_DATA_SUCCESS';
export const RECEIVING_USER_DATA = 'RECEIVING_USER_DATA';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_USER_DATA_SUCCESS,
        payload
    }
}

export function getUser(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_USER_DATA
    });
    const response = await axios.create({ // eslint-disable-line no-unused-vars
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/user/get',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_USER_DATA_SUCCESS,
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




