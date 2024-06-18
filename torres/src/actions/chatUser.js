import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_CHATU_DATA_SUCCESS = 'RECEIVED_CHATU_DATA_SUCCESS';
export const RECEIVING_CHATU_DATA = 'RECEIVING_CHATU_DATA';

export function receiveDataRequest(params) {
    return (dispatch) => {
        dispatch(receivingData(params)).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_CHATU_DATA_SUCCESS,
        payload
    }
}

export function getChatUser(params) { 
  return async (dispatch) => {
    dispatch(receivingData(params));
  };
} 

export function receivingData(params) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_CHATU_DATA
    });
    const response = await axios.create({ //eslint-disable-line no-unused-vars
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/client/chat/get',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_CHATU_DATA_SUCCESS,
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




