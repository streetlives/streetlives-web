import React from 'react';
import { Route } from 'react-router-dom';

import MapPageContainer from './mapPage/MapPageContainer';
import QuestionFlowContainer from './questionFlow/QuestionFlowContainer';
import LocationDetailsContainer from './locationDetails/LocationDetailsContainer';

export default function Router({ match }) {
  return (
    <div>
      <Route path={`${match.path}/:categoryName?`} component={MapPageContainer} />
      <Route
        path={`${match.path}/:categoryName/questions/:question?`}
        component={QuestionFlowContainer}
      />
      <Route path={`${match.path}/location/:locationId`} component={LocationDetailsContainer} />
    </div>
  );
}
