import React from 'react';
import { Route } from 'react-router-dom';

// TODO: Analytics should work, i.e. show us where people dropped off in leaving comments etc.
// import withTracker from './withTracker';
import NewCommentForm from './newCommentForm/NewCommentForm';
import ViewComments from './viewComments/ViewComments';
// TODO: Add the intro page.
// import Intro from './Intro';
import Thanks from './thanks/Thanks';

// TODO: Handle 404.

export default function Router({ match }) {
  return (
    <div className="CommentsRouter">
      {/* <Route exact path={`${match.path}/:locationId/intro`} component={Intro} /> */}
      <Route exact path={`${match.path}/:locationId`} component={ViewComments} />
      <Route exact path={`${match.path}/:locationId/add`} component={NewCommentForm} />
      <Route exact path={`${match.path}/:locationId/thanks`} component={Thanks} />
    </div>
  );
}
