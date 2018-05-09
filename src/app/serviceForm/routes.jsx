import React from 'react';
import { Route } from 'react-router-dom';

import ServiceDescription from './description/ServiceDescription';
import ServiceAgesServed from './agesServed/ServiceAgesServed';
import ServiceWhoDoesItServe from './whoDoesItServe/ServiceWhoDoesItServe';
import ServiceLanguages from './languages/ServiceLanguages';
import ServiceOpeningHours from './openingHours/ServiceOpeningHours';
import ServiceOtherInfo from './otherInfo/ServiceOtherInfo';

const baseRoute = '/location/:locationId/services/:serviceId';

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
    fieldName: 'whoDoesItServe',
  },
  {
    label: 'Ages served',
    urlFragment: '/ages-served',
    metaDataSection: 'service',
    RouteComponent: ServiceAgesServed,
    fieldName: 'agesServed',
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
    fieldName: 'languageIds',
  },
  {
    label: 'Other information',
    urlFragment: '/other-info',
    metaDataSection: 'service',
    RouteComponent: ServiceOtherInfo,
    fieldName: 'additionalInfo',
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
