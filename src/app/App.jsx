import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import PropTypes from 'prop-types';

import Amplify from 'aws-amplify';
import { AmplifyTheme, RequireNewPassword, VerifyContact, Authenticator } from 'aws-amplify-react';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import ConfirmSignUp from './auth/ConfirmSignUp';
import ForgotPassword from './auth/ForgotPassword';
import awsExports from './aws-exports';

import withTracker from './withTracker';
import MapView from './mapView/MapView';
import Recap from './recap/Recap';
import LocationInfo from './locationInfo/LocationInfo';
import LocationForm from './locationForm/LocationForm';
import ServiceContainer from './services/ServiceContainer';
import { store, history } from '../store/index';

import './App.css';

Amplify.configure(awsExports);

function App({ authState }) {
  if (authState !== 'signedIn') return null;
  return (
    <Provider store={store}>
      <div className="App">
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/" component={withTracker(MapView)} />
            <Route path="/recap/:locationId" component={withTracker(Recap)} />
            <Route path="/location/:locationId" component={withTracker(LocationInfo)} />
            <Route path="/questions/:id/:locationId" component={withTracker(LocationForm)} />
            <Route path="/services" component={withTracker(ServiceContainer)} />
          </Switch>
        </ConnectedRouter>
      </div>
    </Provider>
  );
}

App.propTypes = {
  authState: PropTypes.string.isRequired,
};

AmplifyTheme.container.paddingRight = 0;
AmplifyTheme.container.paddingLeft = 0;

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
