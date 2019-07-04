import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../notFound/NotFound';

import MapPageContainer from './mapPage/MapPageContainer';

export default function Router({ match }) {
  return (
    <Switch>
      <Route path={`${match.path}/:categoryName?`} component={MapPageContainer} />
      <Route
        path={`${match.path}/:categoryName/questions/:question?`}
        component={MapPageContainer}
      />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
