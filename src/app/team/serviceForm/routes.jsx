import React from 'react';
import { Route } from 'react-router-dom';

import ServiceDescription from './description/ServiceDescription';
import ServiceWhoDoesItServe from './whoDoesItServe/ServiceWhoDoesItServe';
import ServiceLanguages from './languages/ServiceLanguages';
// import ServiceOpeningHours from './openingHours/ServiceOpeningHours';
import CoronavirusOpeningHours from '../coronavirus/OpeningHours';
// import ServiceOtherInfo from './otherInfo/ServiceOtherInfo';
import CoronavirusOtherInfo from '../coronavirus/OtherInfo';

import ServiceHasHivNutrition from './hasHivNutrition/ServiceHasHivNutrition';
import ServiceClothingOccasions from './clothingOccasions/ServiceClothingOccasions';
import ServiceWhoIsThisClothingFor from './whoIsThisClothingFor/ServiceWhoIsThisClothingFor';
import ServiceTgncClothing from './tgncClothing/ServiceTgncClothing';
import ServiceMembershipCriteria from './membershipCriteria/ServiceMembershipCriteria';
import ServiceArea from './area/ServiceArea';

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
  // {
  //   label: 'Opening hours',
  //   urlFragment: '/opening-hours',
  //   metaDataSection: 'service',
  //   RouteComponent: ServiceOpeningHours,
  //   fieldName: 'hours',
  // },
  {
    label: 'Opening hours (coronavirus)',
    urlFragment: '/opening-hours',
    metaDataSection: 'service',
    RouteComponent: CoronavirusOpeningHours,
    fieldName: 'irregularHours',
  },
  {
    label: 'Languages spoken',
    urlFragment: '/languages',
    metaDataSection: 'service',
    RouteComponent: ServiceLanguages,
    fieldName: 'languages',
  },
  // {
  //   label: 'Other information',
  //   urlFragment: '/other-info',
  //   metaDataSection: 'service',
  //   RouteComponent: ServiceOtherInfo,
  //   fieldName: 'additional_info',
  // },
  {
    label: 'PLHIV',
    urlFragment: '/plhiv',
    RouteComponent: ServiceHasHivNutrition,
    fieldName: 'hasHivNutrition',
    metaDataSection: 'service',
    serviceTaxonomy: 'Food',
  },
  {
    label: 'Occasions',
    urlFragment: '/occasions',
    RouteComponent: ServiceClothingOccasions,
    fieldName: 'clothingOccasion',
    metaDataSection: 'service',
    serviceTaxonomy: 'Clothing',
  },
  {
    label: 'Gender and age',
    urlFragment: '/gender-and-age',
    RouteComponent: ServiceWhoIsThisClothingFor,
    fieldName: 'clothingOccasion',
    metaDataSection: 'service',
    serviceTaxonomy: 'Clothing',
  },
  {
    label: 'TGNC',
    urlFragment: '/tgnc',
    RouteComponent: ServiceTgncClothing,
    fieldName: 'tgncClothing',
    metaDataSection: 'service',
    serviceTaxonomy: 'Clothing',
  },
  {
    label: 'Membership',
    urlFragment: '/membership',
    RouteComponent: ServiceMembershipCriteria,
    fieldName: 'membership',
    metaDataSection: 'service',
  },
  {
    label: 'Service Area',
    urlFragment: '/area',
    RouteComponent: ServiceArea,
    fieldName: 'area',
    metaDataSection: 'service',
  },
  {
    label: 'Other info (coronavirus)',
    urlFragment: '/other-info',
    metaDataSection: 'service',
    RouteComponent: CoronavirusOtherInfo,
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
          onInputFocus={() => {}} // TODO
          onInputBlur={() => {}}
          onFieldVerified={onNext}
        />
        )}
    />
  ));
}
