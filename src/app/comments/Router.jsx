import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../notFound/NotFound';

import NewCommentForm from './newCommentForm/NewCommentForm';
import ViewComments from './viewComments/ViewComments';
import Intro from './intro/Intro';
import Thanks from './thanks/Thanks';

export default function Router({ match }) {
  return (
    <Switch>
      <Route exact path={`${match.path}/:locationId`} component={Intro} />
      <Route exact path={`${match.path}/:locationId/view`} component={ViewComments} />
      <Route exact path={`${match.path}/:locationId/add`} component={NewCommentForm} />
      <Route exact path={`${match.path}/:locationId/thanks`} component={Thanks} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
