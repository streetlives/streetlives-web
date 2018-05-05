// import LocationImage from './image/LocationImage';
import LocationAddress from './address/LocationAddress';
import LocationName from './location-name/LocationName';
import OrganizationName from './organization-name/OrganizationName';
import LocationNumber from './number/LocationNumber';
import LocationWebsite from './website/LocationWebsite';
import OrganizationDescription from './description/OrganizationDescription';
// import AdditionalInfo from './additional-info/AdditionalInfo';

const routes = [
  {
    urlFragment: 'questions/location-address',
    RouteComponent: LocationAddress,
    label: 'Address',
    metaDataSection: 'address',
    fieldName: 'address_1',
  },
  {
    urlFragment: 'questions/organization-name',
    RouteComponent: OrganizationName,
    label: 'Organization name',
    metaDataSection: 'organization',
    fieldName: 'name',
  },
  {
    urlFragment: 'questions/location-name',
    RouteComponent: LocationName,
    label: 'Location name',
    metaDataSection: 'location',
    fieldName: 'name',
  },
  {
    urlFragment: 'questions/location-description',
    RouteComponent: OrganizationDescription,
    label: 'Organization description',
    metaDataSection: 'organization',
    fieldName: 'description',
  },
  {
    urlFragment: 'questions/phone-number',
    RouteComponent: LocationNumber,
    label: 'Phone number',
    metaDataSection: 'location',
    fieldName: 'phones',
  },
  {
    urlFragment: 'questions/website',
    RouteComponent: LocationWebsite,
    label: 'Website',
    metaDataSection: 'organization',
    fieldName: 'url',
  },
];

export default routes;
