import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Map from './map/Map';
import Login from './login/Login';
import Form from './form/Form';

import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Map} />
          <Route path="/login" component={Login} />
          <Route path="/form" component={Form} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
