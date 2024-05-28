import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_INTENT_DATA_SUCCESS = 'RECEIVED_INTENT_DATA_SUCCESS';
export const RECEIVING_INTENT_DATA = 'RECEIVING_INTENT_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_INTENT_DATA_SUCCESS,
        payload
    }
}

export function setupIntent(params) { 
  return async (dispatch) => {
    dispatch(receivingData(params));
  };
} 

export function receivingData(params) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_INTENT_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).get('/registration/card/intent')
      .then((e) => { 
          dispatch({
                type: RECEIVED_INTENT_DATA_SUCCESS,
                payload: e.data
            });
      })
      .catch((e) => { 
        handleError(e);
      })
      .finally(() => { 
      });
    }
}




