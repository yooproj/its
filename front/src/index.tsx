import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Provider} from "react-redux";
import {applyMiddleware, combineReducers, createStore} from "redux";
import keplerGlReducer from "@kepler.gl/reducers";
import {taskMiddleware} from "react-palm/tasks";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const customizedKeplerGlReducer = keplerGlReducer.initialState({
  uiState: {
    // hide all modals when mounted
    currentModal: null
  }
});
const reducer = combineReducers({
  // <-- mount kepler.gl reducer in your app
  keplerGl: customizedKeplerGlReducer,

});
const store = createStore(reducer, {}, applyMiddleware(taskMiddleware));

root.render(

  <Provider store={store}>

    <App />
  </Provider>
);


