import React from 'react';
import { Route } from 'react-router-dom';

import OpeningHours from './OpeningHours';
import OtherInfo from './OtherInfo';

const baseRoute = '/team/coronavirus/location/:locationId/services/:serviceId';

export const SERVICE_FIELDS = [
  {
    label: 'Coronavirus hours',
    urlFragment: '/opening-hours',
    metaDataSection: 'service',
    RouteComponent: OpeningHours,
    fieldName: 'irregularHours',
  },
  {
    label: 'Coronavirus info',
    urlFragment: '/other-info',
    metaDataSection: 'service',
    RouteComponent: OtherInfo,
    fieldName: 'eventRelatedInfo',
  },
];

export default function ServiceRoutes({ onNext }) {
  return SERVICE_FIELDS.map(({
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
