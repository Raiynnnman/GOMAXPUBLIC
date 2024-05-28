import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_OFFREP1_DATA_SUCCESS = 'RECEIVED_OFFREP1_DATA_SUCCESS';
export const RECEIVING_OFFREP1_DATA = 'RECEIVING_OFFREP1_DATA';

export function receiveDataSuccess(payload) {
    return {
        type: RECEIVED_OFFREP1_DATA_SUCCESS,
        payload
    }
}

export function officeReportDownload(params,callback,args) { 
  return async (dispatch) => {
    dispatch(receivingData(params,callback,args));
  };
} 

export function receivingData(params,callback,args) {
  return async (dispatch) => {
    dispatch({
        type: RECEIVING_OFFREP1_DATA
    });
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).post('/admin/report/get',params)
      .then((e) => { 
          dispatch({
                type: RECEIVED_OFFREP1_DATA_SUCCESS,
                payload: e.data.data
            });
            let filename = e.data.data.filename
            let content = atob(e.data.data.content)
            const url = window.URL.createObjectURL(new Blob([content]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
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




