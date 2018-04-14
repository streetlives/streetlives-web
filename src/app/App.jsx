import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Amplify from 'aws-amplify';
import { AmplifyTheme, RequireNewPassword, VerifyContact, Authenticator } from 'aws-amplify-react';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import ConfirmSignUp from './auth/ConfirmSignUp';
import ForgotPassword from './auth/ForgotPassword';
import awsExports from './aws-exports';

import withTracker from './withTracker';
import MapView from './mapView/MapView';
import Form from './form/Form';
import Recap from './recap/Recap';
import LocationInfo from './locationInfo/LocationInfo';
import LocationForm from './locationForm/LocationForm';

import './App.css';

Amplify.configure(awsExports);

class App extends Component {
  render() {
    if (this.props.authState !== 'signedIn') return null;
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={withTracker(MapView)} />
            <Route path="/form" component={withTracker(Form)} />
            <Route path="/recap" component={withTracker(Recap)} />
            <Route path="/location" component={withTracker(LocationInfo)} />
            <Route path="/question" component={withTracker(LocationForm)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

AmplifyTheme.container.paddingRight = AmplifyTheme.container.paddingLeft = 0;

const auth = () => (
  <Authenticator hideDefault theme={AmplifyTheme}>
    <SignIn />
    <ForgotPassword />
    <RequireNewPassword />
    <SignUp />
    <ConfirmSignUp />
    <VerifyContact />
    <App />
  </Authenticator>
);

export default auth;
