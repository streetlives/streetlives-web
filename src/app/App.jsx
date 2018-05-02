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
import LocationRecap from './recap/Recap';
import LocationInfo from './locationInfo/LocationInfo';
import LocationForm from './locationForm/LocationForm';
import ServiceCategories from './service/categories/ServiceCategories';
import ServiceDetails from './service/details/ServiceDetails';
import ServiceRecap from './service/recap/ServiceRecap';
import ServiceFormContainer from './serviceForm/ServiceFormContainer';
import NotFound from './notFound/NotFound';
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
            <Route exact path="/location/:locationId" component={withTracker(LocationInfo)} />
            <Route
              exact
              path="/location/:locationId/recap"
              component={withTracker(LocationRecap)}
            />
            <Route
              exact
              path="/location/:locationId/questions/:questionId"
              component={withTracker(LocationForm)}
            />
            <Route
              exact
              path="/location/:locationId/services/"
              component={withTracker(ServiceCategories)}
            />
            <Route
              exact
              path="/location/:locationId/services/recap"
              component={withTracker(ServiceRecap)}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/"
              component={withTracker(ServiceDetails)}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/:fieldName"
              component={withTracker(ServiceFormContainer)}
            />
            <Route path="*" component={withTracker(NotFound)} />
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
