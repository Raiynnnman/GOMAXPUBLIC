import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_COUP_DATA_SUCCESS = 'RECEIVED_COUP_DATA_SUCCESS';
export const RECEIVING_COUP_DATA = 'RECEIVING_COUP_DATA';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_COUP_DATA_SUCCESS,
        payload
    }
}

export function getCouponAdmin(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_COUP_DATA
    });
    const response = await axios.create({ //eslint-disable-line no-unused-vars
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/admin/coupon/list',params)
      .then((e) => { 
          var g = e.data.data;
          if (g.content) { 
            let filename = e.data.data.filename
            let content = atob(e.data.data.content)
            const url = window.URL.createObjectURL(new Blob([content]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            delete e.data.data.content;
            delete e.data.data.filename;
          } 
          dispatch({
                type: RECEIVED_COUP_DATA_SUCCESS,
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




