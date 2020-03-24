import React from 'react';
import { Route, Switch } from 'react-router-dom';

import withTracker from '../../components/routing/withTracker';
import withAuth from '../../components/routing/withAuth';

import MapView from './mapView/MapView';
// import LocationRecap from './recap/Recap';
import LocationRecap from './coronavirus/Recap';
import NewLocation from './newLocation/NewLocation';
import LocationInfo from './locationInfo/LocationInfo';
import LocationForm from './locationForm/LocationForm';
import ServiceCategories from './service/categories/ServiceCategories';
import ServiceDetailsContainer from './service/details/ServiceDetailsContainer';
import ServiceRecap from './service/recap/ServiceRecap';
import ServiceFormContainer from './serviceForm/ServiceFormContainer';
import DocsFormContainer from './documents/DocsFormContainer';
import DocumentDetails from './documents/details/DocumentDetails';
import CoronavirusServiceRouter from './coronavirus/Router';
import IsLocationClosed from './coronavirus/IsLocationClosed';
import ClosureInfo from './coronavirus/ClosureInfo';
import NotFound from '../notFound/NotFound';

function Router({ match }) {
  return (
    <Switch>
      <Route exact path={`${match.path}/`} component={withTracker(withAuth(MapView))} />
      <Route
        exact
        path={`${match.path}/location`}
        component={withTracker(withAuth(NewLocation))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId`}
        component={withTracker(withAuth(LocationInfo))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/recap`}
        component={withTracker(withAuth(LocationRecap))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/isClosed`}
        component={withTracker(withAuth(IsLocationClosed))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/closureInfo/:thanks?`}
        component={withTracker(withAuth(ClosureInfo))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/questions/:questionId/:thanks?`}
        component={withTracker(withAuth(LocationForm))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/`}
        component={withTracker(withAuth(ServiceCategories))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/recap/:thanks?`}
        component={withTracker(withAuth(ServiceRecap))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/`}
        component={withTracker(withAuth(ServiceDetailsContainer))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/documents`}
        component={withTracker(withAuth(DocumentDetails))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/:fieldName`}
        component={withTracker(withAuth(ServiceFormContainer))}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId/services/:serviceId/documents/:fieldName`}
        component={withTracker(withAuth(DocsFormContainer))}
      />
      <Route
        exact
        path={`${
          match.path
        }/location/:locationId/services/:serviceId/documents/:fieldName/:thanks?`}
        component={withTracker(withAuth(DocsFormContainer))}
      />
      <Route
        path={`${match.path}/coronavirus`}
        component={withTracker(withAuth(CoronavirusServiceRouter))}
      />
      <Route path={`${match.path}/*`} component={withTracker(NotFound)} />
    </Switch>
  );
}

export default Router;
