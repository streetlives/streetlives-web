import React from 'react';
import { Route } from 'react-router-dom';

import ServiceDescription from './description/ServiceDescription';
import ServiceAgesServed from './agesServed/ServiceAgesServed';
import ServiceFoodPreferences from './foodPreferences/ServiceFoodPreferences';
import ServiceAlternativeName from './alternativeName/ServiceAlternativeName';
import ServiceLanguages from './languages/ServiceLanguages';
import ServiceOpeningHours from './openingHours/ServiceOpeningHours';
import ServiceOtherInfo from './otherInfo/ServiceOtherInfo';

const baseRoute = '/location/:locationId/services/:serviceId';

export const SERVICE_FIELDS = [
  { 
    label: 'Service description', 
    route: '/description', 
    RouteComponent: ServiceDescription,
    metaDataSection: 'service',
    fieldName: 'description',
  },
  { 
    label: 'Alternative name', 
    route: '/alt-name', 
    RouteComponent: ServiceAlternativeName,
    metaDataSection: 'service',
    fieldName: 'name',
  },
  { 
    label: 'Who does it serve?', 
    route: '/audience', 
    RouteComponent: ServiceFoodPreferences 
  },
  { 
    label: 'Ages served', 
    route: '/ages-served', 
    RouteComponent: ServiceAgesServed 
  },
  { 
    label: 'Opening hours', 
    route: '/opening-hours', 
    RouteComponent: ServiceOpeningHours 
  },
  { 
    label: 'Languages spoken', 
    route: '/languages', 
    RouteComponent: ServiceLanguages 
  },
  { 
    label: 'Other information', 
    route: '/other-info', 
    RouteComponent: ServiceOtherInfo 
  },
];

export default function ServiceRoutes({ onNext }) {
  return SERVICE_FIELDS.map(({
      RouteComponent, 
      label,
      route,
      metaDataSection,
      fieldName,
    }) => (
    <Route
      key={label}
      path={`${baseRoute}${route}`}
      onFieldVerified={onNext}
      render={ props => <RouteComponent 
        {...props} 
        metaDataSection={metaDataSection}
        fieldName={fieldName}
        onInputFocus={() => {}} //TODO
        onInputBlur={() => {}}
        onFieldVerified={onNext} 
        />
      }
    />
  ));
}
