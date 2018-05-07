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
    component: ServiceDescription,
    metaDataSection: 'service',
    fieldName: 'description',
  },
  { 
    label: 'Alternative name', 
    route: '/alt-name', 
    component: ServiceAlternativeName,
    metaDataSection: 'service',
    fieldName: 'name',
  },
  { 
    label: 'Who does it serve?', 
    route: '/audience', 
    component: ServiceFoodPreferences 
  },
  { 
    label: 'Ages served', 
    route: '/ages-served', 
    component: ServiceAgesServed 
  },
  { 
    label: 'Opening hours', 
    route: '/opening-hours', 
    component: ServiceOpeningHours 
  },
  { 
    label: 'Languages spoken', 
    route: '/languages', 
    component: ServiceLanguages 
  },
  { 
    label: 'Other information', 
    route: '/other-info', 
    component: ServiceOtherInfo 
  },
];

export default function ServiceRoutes({ onNext }) {
  return SERVICE_FIELDS.map(field => (
    <Route
      key={field.label}
      path={`${baseRoute}${field.route}`}
      onFieldVerified={onNext}
      render={props => <field.component {...props} onFieldVerified={onNext} />}
    />
  ));
}
