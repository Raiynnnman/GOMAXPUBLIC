import axios from 'axios';
import config from '../config';
import jwt from "jsonwebtoken";
import { toast } from 'react-toastify';
import { push } from 'connected-react-router';
import Errors from '../components/FormItems/error/errors';
import apiBaseUrl from '../globalConfig.js';
import Cookies from 'universal-cookie';

export const AUTH_FAILURE = 'AUTH_FAILURE';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const RESET_REQUEST = 'RESET_REQUEST';
export const RESET_SUCCESS = 'RESET_SUCCESS';
export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

async function findMe() {
  if (config.isBackend) {
    const response = await axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
        }).get('/profile').catch((e) => { 
            if (e.response.status === 401) { 
                logoutUser();
                return;
            } 
        });
        return response.data.data;
  } 
  
}

export function authError(payload) {
  return {
    type: AUTH_FAILURE,
    payload,
  };
}

export function doInit() {
  return async (dispatch) => {
    let currentUser = null;
    if (!config.isBackend) {
      currentUser = {};
      dispatch({
        type: AUTH_INIT_SUCCESS,
        payload: {
          currentUser,
        },
      });
    } else {
      try {
        let token = localStorage.getItem('token');
        if (token) {
          currentUser = await findMe();
        }
        dispatch({
          type: AUTH_INIT_SUCCESS,
          payload: {
            currentUser,
          },
        });
      } catch (error) {
        Errors.handle(error);

        dispatch({
          type: AUTH_INIT_ERROR,
          payload: error,
        });
      }
    }
  }
}

export function logoutUser() {
    window.location.href='/#/login';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    axios.defaults.headers.common['Authorization'] = "";
    return (dispatch) => {
        dispatch({
          type: LOGOUT_REQUEST,
        });
        dispatch({
          type: LOGOUT_SUCCESS,
        });
      // dispatch(push('/login'));
    };
}

export function receiveToken(token) {
    return (dispatch) => {
        let user;

        if (config.isBackend) {
          user = jwt.decode(token)
        } else {
          user = {
            email: config.auth.email,
            user: {
              id: 'default_no_connection_id_444'
            }
          }
        }
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = "Bearer " + token;
        dispatch({
          type: LOGIN_SUCCESS
        });
        dispatch(push('/app'));
    }
}

export function loginUser(creds) {
    return (dispatch) => {
      const cookies = new Cookies();
      localStorage.setItem("dashboardTheme", 'dark')
      localStorage.setItem('navbarColor', '#F74301')
      localStorage.setItem('navbarType', 'static')
      if (false && !config.isBackend) {
        dispatch(receiveToken('token'));
        dispatch(doInit());
        dispatch(push('/app'));
      } else {
        dispatch({
          type: LOGIN_REQUEST,
        });
        if (creds.social) {
          window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
        } else if (creds.email.length > 0 && creds.password.length > 0) {
          const api = axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }) 
          api.post("/login", creds).then(res => {
                const token = res.data.data.token;
                dispatch(receiveToken(token));
                dispatch(doInit());
                dispatch(push('/app'));
              }).catch(err => {
                if (err && err.response && err.response.status) { 
                    if (err.response.status === 401) { 
                        dispatch(authError("Login Failed. Please try again."));
                    } else if (err.response.status === 423) {
                        dispatch(authError("Account is Locked."));
                    } else {
                        dispatch(authError("Something has gone wrong."));
                    } 
                } else { 
                    dispatch(authError(err.response.data));
                } 
              })
        } else {
          dispatch(authError('Something was wrong. Try again'));
        }
      }
    };
}

export function verifyEmail(token) {
  return(dispatch) => {
    if (!config.isBackend) {
      dispatch(push('/login'));
    } else {
      axios.put("/auth/verify-email", {token}).then(verified => {
        if (verified) {
          toast.success("Your email was verified");
        }
      }).catch(err => {
        toast.error(err.response.data);
      }).finally(() => {
        dispatch(push('/login'));
      })
    }
  }
}

export function resetPassword(token, password) {
  return (dispatch) => {
    if (false && !config.isBackend) {
      dispatch(push('/login'));
    } else {
      dispatch({
        type: RESET_REQUEST,
      });
      axios.create({
            baseURL: apiBaseUrl(),
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
      }).post("/reset", {token:token, password:password}).then(res => {
          if (res.data && res.data.data && !res.data.data.success) { 
            dispatch({
                type: AUTH_FAILURE,
                payload: res.data.data.message
            });
          } else { 
            dispatch({
                type: RESET_SUCCESS,
            });
            toast.success("Password has been updated");
            dispatch(push('/login'));
        }
      }).catch(err => {
        dispatch(authError(err.response.data));
      })
    }
  }
}

export function sendPasswordResetEmail(email) {
  return (dispatch) => {
    if (!config.isBackend) {
      dispatch(push('/login'));
    } else {
      dispatch({
        type: PASSWORD_RESET_EMAIL_REQUEST,
      });
      axios.create({
        baseURL: apiBaseUrl(),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
      }).post("/request", {email:email}).then(res => {
            dispatch({
              type: PASSWORD_RESET_EMAIL_SUCCESS,
            });
            toast.success("Email with resetting instructions has been sent");
            dispatch(push('/login'));
        }).catch(err => {
            dispatch(authError(err.response.data));
        })
    }
  }
}

export function registerUser(creds) {
  return (dispatch) => {
    if (!config.isBackend) {
      dispatch(push('/user/profile'));
    } else {
      dispatch({
        type: REGISTER_REQUEST,
      });

      if (creds.email.length > 0 && creds.password.length > 0) {
        axios.post("/auth/signup", creds).then(res => {
          dispatch({
            type: REGISTER_SUCCESS
          });
          toast.success("You've been registered successfully. Please check your email for verification link");
          dispatch(push('/user/profile'));
        }).catch(err => {
          dispatch(authError(err.response.data));
        })

      } else {
        dispatch(authError('Something was wrong. Try again'));
      }
    }
  };
}
