import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import handleError from './handleError';

export const RECEIVED_PROVDASH_DATA_SUCCESS = 'RECEIVED_PROVDASH_DATA_SUCCESS';
export const RECEIVING_PROVDASH_DATA = 'RECEIVING_PROVDASH_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_PROVDASH_DATA_SUCCESS,
        payload
    }
}

export function getOfficeNotifications(params) { 
  return async (dispatch) => {
    dispatch(receivingData(params));
  };
} 

export function receivingData(params) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_PROVDASH_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).get('/office/dashboard')
      .then((e) => { 
          dispatch({
                type: RECEIVED_PROVDASH_DATA_SUCCESS,
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




