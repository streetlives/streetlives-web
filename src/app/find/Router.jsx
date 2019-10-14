import React from 'react';
import { Route } from 'react-router-dom';

import MapPageContainer from './mapPage/MapPageContainer';
import QuestionFlowContainer from './questionFlow/QuestionFlowContainer';

export default function Router({ match }) {
  return (
    <div>
      <Route path={`${match.path}/:categoryName?`} component={MapPageContainer} />
      <Route
        path={`${match.path}/:categoryName/questions/:question?`}
        component={QuestionFlowContainer}
      />
    </div>
  );
}
