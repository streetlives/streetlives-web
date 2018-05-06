import React from 'react';
import { Route } from 'react-router-dom';

import ServiceDescription from './description/ServiceDescription';
import ServiceAgesServed from './agesServed/ServiceAgesServed';
import ServiceAudience from './audience/ServiceAudience';
import ServiceAlternativeName from './alternativeName/ServiceAlternativeName';
import ServiceEligibility from './eligibility/ServiceEligibility';
import ServiceLanguages from './languages/ServiceLanguages';
import ServicePayment from './payment/ServicePayment';
import ServiceOpeningHours from './openingHours/ServiceOpeningHours';
import ServiceOtherInfo from './otherInfo/ServiceOtherInfo';

const baseRoute = '/location/:locationId/services/:serviceId';

export const SERVICE_FIELDS = [
  { title: 'Service description', route: '/description', component: ServiceDescription },
  { title: 'Alternative name', route: '/alt-name', component: ServiceAlternativeName },
  { title: 'Who does it serve?', route: '/audience', component: ServiceAudience },
  { title: 'Ages served', route: '/ages-served', component: ServiceAgesServed },
  { title: 'Opening hours', route: '/opening-hours', component: ServiceOpeningHours },
  { title: 'Languages spoken', route: '/languages', component: ServiceLanguages },
  { title: 'Cost and payment method', route: '/payment', component: ServicePayment },
  { title: 'Other eligibility criteria', route: '/eligibility', component: ServiceEligibility },
  { title: 'Other information', route: '/other-info', component: ServiceOtherInfo },
];

export default function ServiceRoutes({ onNext }) {
  return SERVICE_FIELDS.map(field => (
    <Route
      key={field.title}
      path={`${baseRoute}${field.route}`}
      onFieldVerified={onNext}
      render={props => <field.component {...props} onFieldVerified={onNext} />}
    />
  ));
}
