import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../notFound/NotFound';

import Thanks from './Thanks';
import NewErrorReportForm from './NewErrorReportForm';

export default function Router({ match }) {
  return (
    <Switch>
      <Route exact path={`${match.path}/:locationId/add`} component={NewErrorReportForm} />
      <Route exact path={`${match.path}/:locationId/thanks`} component={Thanks} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
