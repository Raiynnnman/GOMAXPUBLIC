import React from 'react';
import ReactDOM from 'react-dom';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'
import * as serviceWorker from './serviceWorker';
import axios from 'axios';

import App from './components/App';
import config from './config';
import createRootReducer from './reducers';

import { doInit } from './actions/auth';
import { createHashHistory } from 'history';

const history = createHashHistory();

export function getHistory() {
  return history;
}

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common['Content-Type'] = "application/json";
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;
}


export const store = createStore(
  createRootReducer(history),
  compose(
    applyMiddleware(
      routerMiddleware(history),
      ReduxThunk
    ),
  )
);

store.dispatch(doInit());

const renderReactDom = () => {
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root')
    );
};

document.addEventListener('deviceready', () => {
    renderReactDom();
    universalLinks.subscribe('dl_user_reset', function (eventData) {
      // do some work
      console.log('Did launch application from the link: ' + eventData.url);
    });
}, false);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
