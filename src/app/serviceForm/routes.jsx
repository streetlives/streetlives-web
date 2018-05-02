import React from 'react';
import { Route } from 'react-router-dom';

import withTracker from '../withTracker';

import ServiceDescription from './description/ServiceDescription';
import ServiceAgesServed from './agesServed/ServiceAgesServed';
import ServiceAudience from './audience/ServiceAudience';
import ServiceAlternativeName from './alternativeName/ServiceAlternativeName';
import ServiceEligibility from './eligibility/ServiceEligibility';
import ServiceLanguages from './languages/ServiceLanguages';
import ServicePayment from './payment/ServicePayment';
import ServiceOpeningHours from './openingHours/ServiceOpeningHours';
import ServiceOtherInfo from './otherInfo/ServiceOtherInfo';

export const SERVICE_FIELDS = [
  { title: 'Service description', route: '/description' },
  { title: 'Alternative name', route: '/alt-name' },
  { title: 'Who does it serve?', route: '/audience' },
  { title: 'Ages served', route: '/ages-served' },
  { title: 'Opening hours', route: '/opening-hours' },
  { title: 'Languages spoken', route: '/languages' },
  { title: 'Cost and payment method', route: '/payment' },
  { title: 'Other eligibility criteria', route: '/eligibility' },
  { title: 'Other information', route: '/other-info' },
];

export default function ServiceRoutes() {
  return [
    <Route
      exact
      path="/location/:locationId/services/:serviceId/description"
      component={withTracker(ServiceDescription)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/ages-served"
      component={withTracker(ServiceAgesServed)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/audience"
      component={withTracker(ServiceAudience)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/alt-name"
      component={withTracker(ServiceAlternativeName)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/eligibility"
      component={withTracker(ServiceEligibility)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/languages"
      component={withTracker(ServiceLanguages)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/payment"
      component={withTracker(ServicePayment)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/opening-hours"
      component={withTracker(ServiceOpeningHours)}
    />,
    <Route
      exact
      path="/location/:locationId/services/:serviceId/other-info"
      component={withTracker(ServiceOtherInfo)}
    />,
  ];
}
