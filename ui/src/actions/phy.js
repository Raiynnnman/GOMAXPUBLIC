import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';
const cookies = new Cookies();

export const RECEIVED_PHY_DATA_SUCCESS = 'RECEIVED_PHY_DATA_SUCCESS';
export const RECEIVING_PHY_DATA = 'RECEIVING_PHY_DATA';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_PHY_DATA_SUCCESS,
        payload
    }
}

export function getPhysicians(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_PHY_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/office/physician/list',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_PHY_DATA_SUCCESS,
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




