import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_MYDINV_DATA_SUCCESS = 'RECEIVED_MYDINV_DATA_SUCCESS';
export const RECEIVING_MYDINV_DATA = 'RECEIVING_MYDINV_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_MYDINV_DATA_SUCCESS,
        payload
    }
}

export function mydayApproveInvoice(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_MYDINV_DATA
    });
    const response = await axios.create({ //eslint-disable-line no-unused-vars
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/myday/invoice/approve',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_MYDINV_DATA_SUCCESS,
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




