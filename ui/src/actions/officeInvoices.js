import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';
const cookies = new Cookies();

export const RECEIVED_OFFIN_DATA_SUCCESS = 'RECEIVED_OFFIN_DATA_SUCCESS';
export const RECEIVING_OFFIN_DATA = 'RECEIVING_OFFIN_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_OFFIN_DATA_SUCCESS,
        payload
    }
}

export function getOfficeInvoices(params) { 
  return async (dispatch) => {
    dispatch(receivingData(params));
  };
} 

export function receivingData(params) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_OFFIN_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/office/invoices/list',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_OFFIN_DATA_SUCCESS,
                payload: e.data.data
            });
      })
      .catch((e) => { 
        handleError(e);
      })
      .finally(() => { 
      });
    }
}




