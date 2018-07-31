import React from 'react';
import { Route } from 'react-router-dom';

// TODO: Analytics should work, i.e. show us where people dropped off in leaving comments etc.
// import withTracker from './withTracker';
import Main from './Main';
import NewCommentForm from './newCommentForm/NewCommentForm';
// TODO: Add all the missing pages.
// import ViewComments from './ViewComments';
// import Intro from './Intro';
import Thanks from './thanks/Thanks';

// TODO: Handle 404.

export default function Router({ match }) {
  return (
    <div className="CommentsRouter">
      {/* <Route exact path={`${match.path}/:locationId/intro`} component={Intro} /> */}
      <Route exact path={`${match.path}/:locationId`} component={Main} />
      {/* <Route exact path={`${match.path}/:locationId/view`} component={ViewComments} /> */}
      <Route exact path={`${match.path}/:locationId/add`} component={NewCommentForm} />
      <Route exact path={`${match.path}/:locationId/thanks`} component={Thanks} />
    </div>
  );
}
