import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import Amplify from 'aws-amplify';
import { AmplifyTheme } from 'aws-amplify-react';
import awsExports from './aws-exports';

import withTracker from '../components/routing/withTracker';

import { store, history } from '../store/index';

import './App.css';

import About from './about/About';
import NotFound from './notFound/NotFound';

import TeamRouter from './team/Router';
import CommentsRouter from './comments/Router';
import FindRouter from './find/Router';

history.listen((location, action) => {
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

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/" component={withTracker(About)} />
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
        </ConnectedRouter>
      </div>
    </Provider>
  );
}

AmplifyTheme.container.paddingRight = 0;
AmplifyTheme.container.paddingLeft = 0;

export default App;
