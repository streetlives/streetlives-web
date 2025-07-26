// import LocationImage from './image/LocationImage';
import LocationAddress, { selectValue as selectValueLocationAddress }
  from './address/LocationAddress';
import LocationName, { selectValue as selectValueLocationName }
  from './location-name/LocationName';
import OrganizationName, { selectValue as selectValueOrganizationName }
  from './organization-name/OrganizationName';
import LocationNumber, { selectValue as selectValueLocationNumber }
  from './number/LocationNumber';
import LocationWebsite, { selectValue as selectValueLocationWebsite }
  from './website/LocationWebsite';
import OrganizationDescription, { selectValue as selectValueOrganizationDescription }
  from './description/OrganizationDescription';
import LocationStreetview, { selectValue as selectValueLocationStreetview } from './streetview/LocationStreetview';
// import AdditionalInfo from './additional-info/AdditionalInfo';

const routes = [
  {
    urlFragment: 'questions/location-address',
    RouteComponent: LocationAddress,
    label: 'Address',
    metaDataSection: 'address',
    fieldName: 'address_1',
    selectValue: selectValueLocationAddress,
  },
  {
    urlFragment: 'questions/organization-name',
    RouteComponent: OrganizationName,
    label: 'Organization name',
    metaDataSection: 'organization',
    fieldName: 'name',
    selectValue: selectValueOrganizationName,
  },
  {
    urlFragment: 'questions/location-name',
    RouteComponent: LocationName,
    label: 'Location name',
    metaDataSection: 'location',
    fieldName: 'name',
    selectValue: selectValueLocationName,
  },
  {
    urlFragment: 'questions/location-description',
    RouteComponent: OrganizationDescription,
    label: 'Organization description',
    metaDataSection: 'organization',
    fieldName: 'description',
    selectValue: selectValueOrganizationDescription,
  },
  {
    urlFragment: 'questions/phone-number',
    RouteComponent: LocationNumber,
    label: 'Phone number',
    metaDataSection: 'location',
    fieldName: 'phones',
    selectValue: selectValueLocationNumber,
  },
  {
    urlFragment: 'questions/website',
    RouteComponent: LocationWebsite,
    label: 'Website',
    metaDataSection: 'organization',
    fieldName: 'url',
    selectValue: selectValueLocationWebsite,
  },
  {
    urlFragment: 'questions/street-view',
    RouteComponent: LocationStreetview,
    label: 'Streetview',
    metaDataSection: 'location',
    fieldName: 'streetview_url',
    selectValue: selectValueLocationStreetview,
  },
];

export default routes;
