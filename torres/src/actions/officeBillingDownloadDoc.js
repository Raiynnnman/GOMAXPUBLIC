import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_OFDD_DATA_SUCCESS = 'RECEIVED_OFDD_DATA_SUCCESS';
export const RECEIVING_OFDD_DATA = 'RECEIVING_OFDD_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_OFDD_DATA_SUCCESS,
        payload
    }
}

export function getOfficeBillingDocument(params) { 
  return async (dispatch) => {
    dispatch(receivingData(params));
  };
} 

export function receivingData(params) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_OFDD_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/myday/billing/document/get',params)
      .then((e) => { 
          let filename = e.data.data.filename
          var b = atob(e.data.data.content);
          var len = b.length
          var buffer = new ArrayBuffer(len);
          var view = new Uint8Array(buffer);
          for (var i = 0; i < len; i++) {
            view[i] = b.charCodeAt(i);
          }
          var blob = new Blob([view],{type:"application/pdf"});
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          dispatch({
                type: RECEIVED_OFDD_DATA_SUCCESS,
                payload: {}
            });
      })
      .catch((e) => { 
        handleError(e);
      })
      .finally(() => { 
      });
    }
}




