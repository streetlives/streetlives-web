// import LocationImage from './image/LocationImage';
import LocationAddress from './address/LocationAddress';
import LocationName from './name/LocationName';
import OrganizationName from './name/OrganizationName';
import LocationNumber from './number/LocationNumber';
import LocationWebsite from './website/LocationWebsite';
import LocationDescription from './description/LocationDescription';
// import AdditionalInfo from './additional-info/AdditionalInfo';

const routes = [
  //  ["/questions/entrance-picture", LocationImage, "Entrance picture", true],   //TODO: re-enable when support is added to db
  ['/questions/location-address', LocationAddress, 'Address'],
  ['/questions/organization-name', OrganizationName, 'Organization name'],
  ['/questions/location-name', LocationName, 'Location name'],
  ['/questions/location-description', LocationDescription, 'Location description'],
  ['/questions/phone-number', LocationNumber, 'Phone number', true],
  ['/questions/website', LocationWebsite, 'Website'],
  //  ["/questions/additional-info", AdditionalInfo, "Additional info"]           //TODO: re-enable when support is added to db
];

export default routes;
