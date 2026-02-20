import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import Amplify from 'aws-amplify';
import { AmplifyTheme } from 'aws-amplify-react';
import awsExports from './aws-exports';

import { store, history } from '../store/index';

import './App.css';
import './IconLibrary';

import LandingPage from './landing/LandingPage';
import NotFound from './notFound/NotFound';
import LoadingLabel from '../components/form/LoadingLabel';

import { getCanonicalUrl } from '../services/seo';

import withTracker from '../components/routing/withTracker';
import analytics from '../services/analytics';

const TeamRouter = React.lazy(() => import('./team/Router'));
const CommentsRouter = React.lazy(() => import('./comments/Router'));
const findRouterPromise = import('./find/Router');
const FindRouter = React.lazy(() => findRouterPromise);

history.listen(() => {
  analytics.track('Page View');
  window.scrollTo(0, 0);
});

Amplify.configure(awsExports);

// TODO: Try coming up with a better way of mapping than hard-coding the current prod IDs.
const feedbackLocations = [
  { name: 'sjbl', id: '1edfab8e-0d7c-437e-a14c-6b9ca0eb5d93' },
  { name: 'holy', id: '5426de21-4e1b-4e6e-bcf1-6bf334de56b5' },
  { name: 'sjbl-vol', id: 'c46faf1f-2af0-4ea7-b69c-cd482d10eda3' },
  { name: 'holy-vol', id: '7db4cde4-add1-40ad-9209-9a0e8c57078f' },
];

const routeFixingDoubleSlashes = () => (
  <Route
    exact
    strict
    path="(.*//+.*)"
    render={({ location }) => <Redirect to={location.pathname.replace(/\/\/+/g, '/')} />}
  />
);

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Helmet>
          <link rel="canonical" href={getCanonicalUrl()} />
        </Helmet>
        <ConnectedRouter history={history}>
          <Suspense fallback={<LoadingLabel>Loading</LoadingLabel>}>
            <Switch>
              {routeFixingDoubleSlashes()}

              <Route exact path="/" component={withTracker(LandingPage)} />
              <Route exact path="/covidnotif" component={withTracker(LandingPage)} />
              <Route path="/team" component={withTracker(TeamRouter)} />
              {feedbackLocations.map(({ name, id }) => (
                <Route
                  key={name}
                  exact
                  path={`/${name}`}
                  render={props => <Redirect to={`/comments/${id}`} />}
                />
              ))}
              <Route path="/comments" component={withTracker(CommentsRouter)} />
              <Route path="/find" component={withTracker(FindRouter)} />
              <Route path="*" component={withTracker(NotFound)} />
            </Switch>
          </Suspense>
        </ConnectedRouter>
      </div>
    </Provider>
  );
}

AmplifyTheme.container.paddingRight = 0;
AmplifyTheme.container.paddingLeft = 0;

export default App;
