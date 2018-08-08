import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../notFound/NotFound';

import NewCommentForm from './newCommentForm/NewCommentForm';
import ViewComments from './viewComments/ViewComments';
import Intro from './intro/Intro';
import Thanks from './thanks/Thanks';

// TODO: Try coming up with a better way of mapping than hard-coding the current prod IDs.
const locationNames = {
  bnl: '1edfab8e-0d7c-437e-a14c-6b9ca0eb5d93',
  apostles: '5426de21-4e1b-4e6e-bcf1-6bf334de56b5',
};

const withFriendlyUrls = RouteComponent => (props) => {
  const { locationId } = props.match.params;

  const propsWithModifiedLocationId = { ...props };
  propsWithModifiedLocationId.match.params.locationId = locationNames[locationId] || locationId;

  return <RouteComponent {...propsWithModifiedLocationId} />;
};

export default function Router({ match }) {
  const { path } = match;
  return (
    <Switch>
      <Route exact path={`${path}/:locationId`} component={withFriendlyUrls(Intro)} />
      <Route exact path={`${path}/:locationId/view`} component={withFriendlyUrls(ViewComments)} />
      <Route exact path={`${path}/:locationId/add`} component={withFriendlyUrls(NewCommentForm)} />
      <Route exact path={`${path}/:locationId/thanks`} component={withFriendlyUrls(Thanks)} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
