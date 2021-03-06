import React from 'react';
import { Route } from 'react-router-dom';

import ServiceDescription from './description/ServiceDescription';
import ServiceWhoDoesItServe from './whoDoesItServe/ServiceWhoDoesItServe';
import ServiceLanguages from './languages/ServiceLanguages';
import ServiceOpeningHours from './openingHours/ServiceOpeningHours';
import ServiceOtherInfo from './otherInfo/ServiceOtherInfo';

const baseRoute = '/team/location/:locationId/services/:serviceId';

export const SERVICE_FIELDS = [
  {
    label: 'Service description',
    urlFragment: '/description',
    RouteComponent: ServiceDescription,
    metaDataSection: 'service',
    fieldName: 'description',
  },
  {
    label: 'Who does it serve?',
    urlFragment: '/who-does-it-serve',
    metaDataSection: 'service',
    RouteComponent: ServiceWhoDoesItServe,
    fieldName: 'who_does_it_serve',
  },
  {
    label: 'Opening hours',
    urlFragment: '/opening-hours',
    metaDataSection: 'service',
    RouteComponent: ServiceOpeningHours,
    fieldName: 'hours',
  },
  {
    label: 'Languages spoken',
    urlFragment: '/languages',
    metaDataSection: 'service',
    RouteComponent: ServiceLanguages,
    fieldName: 'languages',
  },
  {
    label: 'Other information',
    urlFragment: '/other-info',
    metaDataSection: 'service',
    RouteComponent: ServiceOtherInfo,
    fieldName: 'additional_info',
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
          onInputFocus={() => {}} // TODO
          onInputBlur={() => {}}
          onFieldVerified={onNext}
        />
        )}
    />
  ));
}
