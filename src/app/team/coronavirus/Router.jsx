import React from 'react';
import { Route, Switch } from 'react-router-dom';

import withTracker from '../../../components/routing/withTracker';
import withAuth from '../../../components/routing/withAuth';

import MapView from './MapView';
import Recap from './Recap';
import IsLocationClosed from './IsLocationClosed';
import ClosureInfo from './ClosureInfo';
import ServiceRecap from '../service/recap/ServiceRecap';
import ServiceFormContainer from './ServiceFormContainer';
import NotFound from '../../notFound/NotFound';

const WrappedServiceRecap = withTracker(withAuth(ServiceRecap));
const WrappedIsLocationClosed = withTracker(withAuth(IsLocationClosed));

function Router({ match }) {
  return (
    <Switch>
      <Route exact path={`${match.path}/`} component={withTracker(withAuth(MapView))} />
      <Route
        exact
        path={`${match.path}/location/:locationId/recap`}
        component={withTracker(withAuth(Recap))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/isClosed`}
        render={props => (
          <WrappedIsLocationClosed
            {...props}
            nextUrl={`${match.path}/location/${props.match.params.locationId}/services/recap`}
          />
        )}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/closureInfo/:thanks?`}
        component={withTracker(withAuth(ClosureInfo))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/recap/:thanks?`}
        render={props => (
          <WrappedServiceRecap
            {...props}
            backTarget={`${match.path}/location/${props.match.params.locationId}/isClosed`}
          />
        )}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/`}
        component={withTracker(withAuth(ServiceFormContainer))}
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
