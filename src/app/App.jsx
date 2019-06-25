import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import Amplify from 'aws-amplify';
import { AmplifyTheme, RequireNewPassword, VerifyContact, Authenticator } from 'aws-amplify-react';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import ConfirmSignUp from './auth/ConfirmSignUp';
import ForgotPassword from './auth/ForgotPassword';
import awsExports from './aws-exports';

import withTracker from './withTracker';
import About from './about/About';
import MapView from './mapView/MapView';
import LocationRecap from './recap/Recap';
import NewLocation from './newLocation/NewLocation';
import LocationInfo from './locationInfo/LocationInfo';
import LocationForm from './locationForm/LocationForm';
import ServiceCategories from './service/categories/ServiceCategories';
import ServiceDetails from './service/details/ServiceDetails';
import ServiceRecap from './service/recap/ServiceRecap';
import ServiceFormContainer from './serviceForm/ServiceFormContainer';
import DocsFormContainer from './documents/DocsFormContainer';
import DocumentDetails from './documents/details/DocumentDetails';
import CommentsRouter from './comments/Router';
// TODO: Move all the SSTT routes under /team, and make the end-user ones the main router.
import FindRouter from './find/Router';
import NotFound from './notFound/NotFound';
import { store, history } from '../store/index';
import config from '../config';

import './App.css';

history.listen((location, action) => {
  window.scrollTo(0, 0);
});

Amplify.configure(awsExports);

const withAuth = (Component) => {
  if (config.disableAuth) {
    return Component;
  }

  return (props) => {
    const ComponentRenderedOnlyOnAuth = ({ authState }) =>
      (authState === 'signedIn' ? <Component {...props} /> : null);

    return (
      <Authenticator hideDefault theme={AmplifyTheme}>
        <SignIn />
        <ForgotPassword />
        <RequireNewPassword />
        <SignUp />
        <ConfirmSignUp />
        <VerifyContact />
        <ComponentRenderedOnlyOnAuth />
      </Authenticator>
    );
  };
};

// TODO: Try coming up with a better way of mapping than hard-coding the current prod IDs.
const feedbackLocations = [
  { name: 'sjbl', id: '1edfab8e-0d7c-437e-a14c-6b9ca0eb5d93' },
  { name: 'holy', id: '5426de21-4e1b-4e6e-bcf1-6bf334de56b5' },
  { name: 'sjbl-vol', id: 'c46faf1f-2af0-4ea7-b69c-cd482d10eda3' },
  { name: 'holy-vol', id: '7db4cde4-add1-40ad-9209-9a0e8c57078f' },
];

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/" component={withTracker(About)} />
            <Route exact path="/team" component={withTracker(withAuth(MapView))} />
            {feedbackLocations.map(({ name, id }) => (
              <Route
                key={name}
                exact
                path={`/${name}`}
                render={props => <Redirect to={`/comments/${id}`} />}
              />
            ))}
            <Route
              exact
              path="/location"
              component={withTracker(withAuth(NewLocation))}
            />
            <Route
              exact
              path="/location/:locationId"
              component={withTracker(withAuth(LocationInfo))}
            />
            <Route
              exact
              path="/location/:locationId/recap"
              component={withTracker(withAuth(LocationRecap))}
            />
            <Route
              exact
              path="/location/:locationId/questions/:questionId/:thanks?"
              component={withTracker(withAuth(LocationForm))}
            />
            <Route
              exact
              path="/location/:locationId/services/"
              component={withTracker(withAuth(ServiceCategories))}
            />
            <Route
              exact
              path="/location/:locationId/services/recap/:thanks?"
              component={withTracker(withAuth(ServiceRecap))}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/"
              component={withTracker(withAuth(ServiceDetails))}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/documents"
              component={withTracker(withAuth(DocumentDetails))}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/:fieldName"
              component={withTracker(withAuth(ServiceFormContainer))}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/documents/:fieldName"
              component={withTracker(withAuth(DocsFormContainer))}
            />
            <Route
              exact
              path="/location/:locationId/services/:serviceId/documents/:fieldName/:thanks?"
              component={withTracker(withAuth(DocsFormContainer))}
            />
            <Route
              path="/comments"
              component={withTracker(CommentsRouter)}
            />
            <Route
              path="/find"
              component={withTracker(FindRouter)}
            />
            <Route path="*" component={withTracker(NotFound)} />
          </Switch>
        </ConnectedRouter>
      </div>
    </Provider>
  );
}

AmplifyTheme.container.paddingRight = 0;
AmplifyTheme.container.paddingLeft = 0;

export default App;
