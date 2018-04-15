import LocationImage from './image/LocationImage';
import LocationAddress from './address/LocationAddress';
import LocationName from './name/LocationName';
import OrganizationName from './name/OrganizationName';
import LocationNumber from './number/LocationNumber';
import LocationWebsite from './website/LocationWebsite';
import LocationDescription from './description/LocationDescription';
import AdditionalInfo from './additional-info/AdditionalInfo';


const routes = [
  ["/questions/entrance-picture", LocationImage],
  ["/questions/location-address", LocationAddress],
  ["/questions/organization-name", OrganizationName],
  ["/questions/location-name", LocationName],
  ["/questions/location-description", LocationDescription],
  ["/questions/phone-number", LocationNumber],
  ["/questions/website", LocationWebsite],
  ["/questions/additional-info", AdditionalInfo]
];

export default routes;
