import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';
const cookies = new Cookies();

export const RECEIVED_COMM_DATA_SUCCESS = 'RECEIVED_COMM_DATA_SUCCESS';
export const RECEIVING_COMM_DATA = 'RECEIVING_COMM_DATA';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_COMM_DATA_SUCCESS,
        payload
    }
}

export function getCommissionAdmin(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_COMM_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/admin/commission/list',params)
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
                type: RECEIVED_COMM_DATA_SUCCESS,
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




