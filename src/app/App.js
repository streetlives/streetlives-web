import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import withTracker from "./withTracker";

import Amplify from 'aws-amplify';
import { 
  AmplifyTheme,
//	ConfirmSignIn,
	ConfirmSignUp,
//	ForgotPassword,
	Greetings,
	RequireNewPassword,
//	SignIn,
	SignUp,
//	Theme,
	VerifyContact,
  Authenticator } from 'aws-amplify-react';
import SignIn from './auth/SignIn';
import ForgotPassword from './auth/ForgotPassword';
import aws_exports from './aws-exports';


import Map from "./map/Map";
import Form from "./form/Form";

import "./App.css";

Amplify.configure(aws_exports);


class App extends Component {

  render() {
    if(this.props.authState !== 'signedIn') return null;
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={withTracker(Map)} />
            <Route path="/form" component={withTracker(Form)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

AmplifyTheme.container.paddingRight = AmplifyTheme.container.paddingLeft = 0;

const auth = () => (
  <Authenticator hideDefault={true} theme={AmplifyTheme}>
    <Greetings />
    <SignIn  />
    <ForgotPassword  />
    <RequireNewPassword  />
    <SignUp  />
    <ConfirmSignUp  />
    <VerifyContact  />
    <App />
  </Authenticator>
);

export default auth;

