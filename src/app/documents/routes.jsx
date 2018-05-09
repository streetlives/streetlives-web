import React from 'react';
import { Route } from 'react-router-dom';

import DocsProofs from './proofs/DocsProofs';
import DocsOtherInfo from './otherInfo/DocsOtherInfo';
import DocsGracePeriod from './gracePeriod/DocsGracePeriod';
import DocsCertTime from './certTime/DocsCertTime';

const baseRoute = '/location/:locationId/services/:serviceId/documents';

export const DOCUMENT_FIELDS = [
  {
    label: 'Proofs required',
    urlFragment: '/proofs-required',
    RouteComponent: DocsProofs,
    metaDataSection: 'documents',
    fieldName: 'proofs',
  },
  {
    label: 'Recertification time',
    urlFragment: '/recertification-time',
    RouteComponent: DocsCertTime,
    metaDataSection: 'documents',
    fieldName: 'certTime',
  },
  {
    label: 'Grace period',
    urlFragment: '/grace-period',
    RouteComponent: DocsGracePeriod,
    metaDataSection: 'documents',
    fieldName: 'gracePeriod',
  },
  {
    label: 'Other information',
    urlFragment: '/other-info',
    RouteComponent: DocsOtherInfo,
    metaDataSection: 'documents',
    fieldName: 'additionalInfo',
  },
];

export default function DocumentRoutes({ onNext }) {
  return DOCUMENT_FIELDS.map(({
    RouteComponent, label, urlFragment, metaDataSection, fieldName,
  }) => (
    <Route
      key={label}
      path={`${baseRoute}${urlFragment}`}
      onFieldVerified={onNext}
      render={props => (
        <RouteComponent
          {...props}
          metaDataSection={metaDataSection}
          fieldName={fieldName}
          onInputFocus={() => {}}
          onInputBlur={() => {}}
          onFieldVerified={onNext}
        />
        )}
    />
  ));
}
