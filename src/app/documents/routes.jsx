import React from 'react';
import { Route } from 'react-router-dom';

import withTracker from '../withTracker';
import DocsProofs from './proofs/DocsProofs';
import DocsOtherInfo from './otherInfo/DocsOtherInfo';
import DocsGracePeriod from './gracePeriod/DocsGracePeriod';
import DocsCertTime from './certTime/DocsCertTime';

const baseRoute = '/location/:locationId/services/:serviceId/documents';

export const DOCUMENT_FIELDS = [
  {
    label: 'Proofs required',
    route: '/proofs-required',
    component: DocsProofs,
    metaDataSection: 'documents',
  },
  {
    label: 'Recertification time',
    route: '/recertification-time',
    component: DocsCertTime,
    metaDataSection: 'documents',
  },
  {
    label: 'Grace period',
    route: '/grace-period',
    component: DocsGracePeriod,
    metaDataSection: 'documents',
  },
  {
    label: 'Other information',
    route: '/other-info',
    component: DocsOtherInfo,
    metaDataSection: 'documents',
  },
];

export default function DocumentRoutes() {
  return DOCUMENT_FIELDS.map(field => (
    <Route
      key={field.label}
      path={`${baseRoute}${field.route}`}
      component={withTracker(field.component)}
    />
  ));
}
