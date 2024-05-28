import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_GOP_DATA_SUCCESS = 'RECEIVED_GOP_DATA_SUCCESS';
export const RECEIVING_GOP_DATA = 'RECEIVING_GOP_DATA';

export function receiveDataRequest() {
    return (dispatch) => {
        dispatch(receivingData()).then(data => {
            dispatch(receiveDataSuccess(data));
        });
    };
}

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_GOP_DATA_SUCCESS,
        payload
    }
}

export function getOfficePatients() { 
  return async (dispatch) => {
    dispatch(receivingData());
  };
} 

export function receivingData() {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_GOP_DATA
    });
    const response = await axios.create({ //eslint-disable-line no-unused-vars
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).get('myday/office/patients')
      .then((e) => { 
          dispatch({
                type: RECEIVED_GOP_DATA_SUCCESS,
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
