import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';
const cookies = new Cookies();

export const RECEIVED_CBDD_DATA_SUCCESS = 'RECEIVED_CBDD_DATA_SUCCESS';
export const RECEIVING_CBDD_DATA = 'RECEIVING_CBDD_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_CBDD_DATA_SUCCESS,
        payload
    }
}

export function getLegalBillingDocument(params) { 
  return async (dispatch) => {
    dispatch(receivingData(params));
  };
} 

export function receivingData(params) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_CBDD_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/legal/billing/document/get',params)
      .then((e) => { 
          let filename = e.data.data.filename
          let content = atob(e.data.data.content)
          const url = window.URL.createObjectURL(new Blob([content]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          dispatch({
                type: RECEIVED_CBDD_DATA_SUCCESS,
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




