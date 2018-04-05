import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import withTracker from "./withTracker";

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
            <Route exact path="/" component={withTracker(Map)} />
            <Route path="/login" component={withTracker(Login)} />
            <Route path="/form" component={withTracker(Form)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
