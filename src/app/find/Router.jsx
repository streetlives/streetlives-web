import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../notFound/NotFound';

import MapPage from './mapPage/MapPage';

export default function Router({ match }) {
  return (
    <Switch>
      <Route exact path={`${match.path}`} component={MapPage} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
