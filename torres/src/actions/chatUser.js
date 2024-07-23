import axios from 'axios';
import apiBaseUrl from '../globalConfig.js';
import 'react-toastify/dist/ReactToastify.css';
import handleError from './handleError';

export const RECEIVED_CHATU_DATA_SUCCESS = 'RECEIVED_CHATU_DATA_SUCCESS';
export const RECEIVING_CHATU_DATA = 'RECEIVING_CHATU_DATA';

export function receiveDataRequest(params) {
    return async (dispatch) => {
        try {
            await dispatch(receivingData(params));
            const data = await getChatUser(params)(dispatch);
            dispatch(receiveDataSuccess(data));
        } catch (error) {
            handleError(error);
        }
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
        try {
            dispatch(receivingData(params));
        } catch (error) {
            handleError(error);
        }
    };
} 

export function receivingData(params) {
    return async (dispatch) => {
        dispatch({
            type: RECEIVING_CHATU_DATA
        });

        try {
            const response = await axios.create({
                baseURL: apiBaseUrl(),
                withCredentials: true,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }).post('/client/chat/get', params);

            // console.log('Response:', response);

            dispatch({
                type: RECEIVED_CHATU_DATA_SUCCESS,
                payload: response.data.data
            });
        } catch (error) {
            handleError(error);
        }
    };
}
