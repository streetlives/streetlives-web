/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.css';
import './index.css';
import App from './app/App';
import registerServiceWorker from './registerServiceWorker';
import 'babel-polyfill';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
