import React from 'react';
import { Route, Switch } from 'react-router-dom';

import withTracker from '../../../components/routing/withTracker';
import withAuth from '../../../components/routing/withAuth';

import MapView from './MapView';
import ServiceRecap from '../service/recap/ServiceRecap';
import ServiceDetailsContainer from './ServiceDetailsContainer';
import ServiceFormContainer from './ServiceFormContainer';
import NotFound from '../../notFound/NotFound';

const WrappedServiceRecap = withTracker(withAuth(ServiceRecap));

function Router({ match }) {
  return (
    <Switch>
      <Route exact path={`${match.path}/`} component={withTracker(withAuth(MapView))} />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/recap/:thanks?`}
        render={props => <WrappedServiceRecap {...props} backTarget="/team/coronavirus" />}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/`}
        component={withTracker(withAuth(ServiceDetailsContainer))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/:fieldName/:thanks?`}
        component={withTracker(withAuth(ServiceFormContainer))}
      />
      <Route path={`${match.path}/*`} component={withTracker(NotFound)} />
    </Switch>
  );
}

export default Router;
