import React from 'react';
import { Route } from 'react-router-dom';

import MapPageContainer from './mapPage/MapPageContainer';
import QuestionFlowContainer from './questionFlow/QuestionFlowContainer';
import LocationDetailsContainer from './locationDetails/LocationDetailsContainer';
import ErrorReportContainer from './errorReports/ErrorReportContainer';

export default function Router({ match }) {
  return (
    <div>
      <Route
        path={`${match.path}/:categoryName?`}
        component={MapPageContainer}
      />
      <Route
        path={`${match.path}/:categoryName/questions/:question?`}
        component={QuestionFlowContainer}
      />
      <Route
        exact
        path={`${match.path}/location/:locationId`}
        component={LocationDetailsContainer}
      />
      <Route
        path={`${match.path}/location/:locationId/errorreports`}
        component={ErrorReportContainer}
      />
      <Route
        exact
        path={`${match.path}/:categoryName/location/:locationId`}
        component={LocationDetailsContainer}
      />
      <Route
        path={`${match.path}/:categoryName/location/:locationId/errorreports`}
        component={ErrorReportContainer}
      />
    </div>
  );
}
