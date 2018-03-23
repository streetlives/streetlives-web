import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Map from "./map/Map";
import Login from "./login/Login";
import Form from "./form/Form";

import "./App.css";

class App extends Component {
  render() {
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
}

export default App;
