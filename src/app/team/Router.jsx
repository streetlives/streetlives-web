import React from 'react';
import { Route, Switch } from 'react-router-dom';

import withTracker from '../../components/routing/withTracker';
import withAuth from '../../components/routing/withAuth';

import MapView from './mapView/MapView';
import LocationRecap from './recap/Recap';
import NewLocation from './newLocation/NewLocation';
import LocationInfo from './locationInfo/LocationInfo';
import LocationForm from './locationForm/LocationForm';
import ServiceCategories from './service/categories/ServiceCategories';
import ServiceDetails from './service/details/ServiceDetails';
import ServiceRecap from './service/recap/ServiceRecap';
import ServiceFormContainer from './serviceForm/ServiceFormContainer';
import DocsFormContainer from './documents/DocsFormContainer';
import DocumentDetails from './documents/details/DocumentDetails';
import NotFound from '../notFound/NotFound';
import ErrorBar from './errorBar/ErrorBar';

function Router({ match }) {
  return (
    <div>
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
          component={withTracker(withAuth(ServiceDetails))}
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
          path={
            `${match.path}/location/:locationId/services/:serviceId/documents/:fieldName/:thanks?`}
          component={withTracker(withAuth(DocsFormContainer))}
        />
        <Route path={`${match.path}/*`} component={withTracker(NotFound)} />
      </Switch>
      <ErrorBar />
    </div>
  );
}

export default Router;
