import React from 'react';
import { Route } from 'react-router-dom';

import withTracker from '../withTracker';
import DocsProofs from './proofs/DocsProofs';
import DocsOtherInfo from './otherInfo/DocsOtherInfo';
import DocsGracePeriod from './gracePeriod/DocsGracePeriod';
import DocsCertTime from './certTime/DocsCertTime';

const baseRoute = '/location/:locationId/services/:serviceId/documents';

export const DOCUMENT_FIELDS = [
  { title: 'Proofs required', route: '/proofs-required', component: DocsProofs },
  { title: 'Recertification time', route: '/recertification-time', component: DocsCertTime },
  { title: 'Grace period', route: '/grace-period', component: DocsGracePeriod },
  { title: 'Other information', route: '/other-info', component: DocsOtherInfo },
];

export default function DocumentRoutes() {
  return DOCUMENT_FIELDS.map(field => (
    <Route
      key={field.title}
      path={`${baseRoute}${field.route}`}
      component={withTracker(field.component)}
    />
  ));
}
