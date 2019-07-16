import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../notFound/NotFound';

import MapPageContainer from './mapPage/MapPageContainer';
import QuestionFlowContainer from './questionFlow/QuestionFlowContainer';

const MapPageRouter = ({ baseMatch }) => (
  <div>
    <Route component={MapPageContainer} />
    <Route
      path={`${baseMatch.path}/:categoryName/questions/:question?`}
      component={QuestionFlowContainer}
    />
  </div>
);

export default function Router({ match }) {
  return (
    <Switch>
      {[
        `${match.path}/:categoryName?`,
        `${match.path}/:categoryName/questions/:question?`,
      ].map(path => (
        <Route
          key={path}
          exact
          path={path}
          render={routeProps => <MapPageRouter {...routeProps} baseMatch={match} />}
        />
      ))}
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
