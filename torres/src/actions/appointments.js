import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_CUST_DATA_SUCCESS = 'RECEIVED_CUST_DATA_SUCCESS';
export const RECEIVING_CUST_DATA = 'RECEIVING_CUST_DATA';
export const ADD_PROVIDER_TO_APPOINTMENT = 'ADD_PROVIDER_TO_APPOINTMENT';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_CUST_DATA_SUCCESS,
        payload
    }
}


export function getAppointments(params, callback, args) { 
    return async (dispatch) => {
        dispatch(receivingData(params, callback, args));
    };
} 

export function receivingData(params, callback, args) {
    return async (dispatch) => {
        dispatch({
            type: RECEIVING_CUST_DATA
        });
        const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        }).post('/client/appointments', params)
        .then((e) => { 
            dispatch({
                type: RECEIVED_CUST_DATA_SUCCESS,
                payload: e.data.data
            });
            if (callback) {
                if (!e.data.data.success) {
                    callback(e.data.data, args);
                } else {
                    callback(null, args, e.data.data);
                }
            }
        })
        .catch((e) => { 
            handleError(e, callback, args);
        })
        .finally(() => { 
        });
    }
    
}
export function createAppointment(params, callback) {
   return async (dispatch) => {
      dispatch({ type: RECEIVING_CUST_DATA });
      try {
        console.log(params)
          const response = await axios.post('/client/appointments', params, {
              withCredentials: true,
              headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
              },
          });
          dispatch(receiveDataSuccess(response.data.data));
          if (callback) {
              if (!response.data.data.success) {
                  callback(response.data.data);
              } else {
                  callback(null, response.data.data);
              }
          }
      } catch (error) {
          handleError(error, callback);
      }
  };
}