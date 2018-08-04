import React from 'react';
import { Route } from 'react-router-dom';

import NewCommentForm from './newCommentForm/NewCommentForm';
import ViewComments from './viewComments/ViewComments';
import Intro from './intro/Intro';
import Thanks from './thanks/Thanks';

// TODO: Handle 404.

export default function Router({ match }) {
  return (
    <div className="CommentsRouter">
      <Route exact path={`${match.path}/:locationId`} component={Intro} />
      <Route exact path={`${match.path}/:locationId/view`} component={ViewComments} />
      <Route exact path={`${match.path}/:locationId/add`} component={NewCommentForm} />
      <Route exact path={`${match.path}/:locationId/thanks`} component={Thanks} />
    </div>
  );
}
