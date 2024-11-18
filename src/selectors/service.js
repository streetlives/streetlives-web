import { selectLocationData } from './location';
import { DAYS } from '../Constants';

export const getServiceId = props => props.match.params.serviceId;

export const getTaxonomy = (state, props) => state.locations.taxonomy;

export const getServices = (state, props) => (
  (selectLocationData(state, props) || {}).Services || []
);

export const getService = (state, props) => {
  const serviceId = getServiceId(props);
  const services = getServices(state, props);
  return services.filter(el => el.id === serviceId)[0] || {};
};

export const getServiceName = (state, props) => getService(state, props).name;

export const getServiceDescription = (state, props) => getService(state, props).description;

export const getServiceAgesServed = (state, props) => getService(state, props).ages_served;

export const getServiceTaxonomy = (state, props) => {
  const taxonomy = (getService(state, props).Taxonomies || [])[0];
  return taxonomy && (taxonomy.parent_name || taxonomy.name);
};

export const getServiceWhoDoesItServe = (state, props) => {

  const eligibilities = getService(state, props).Eligibilities;
  const currentValues = getService(state, props).who_does_it_serve;

  if (currentValues) return currentValues;


  if (eligibilities) {
    
    // console.log(eligibilities)

    const whoDoesItServe = eligibilities.find(item => item.EligibilityParameter.name === 'age')
  
    if (whoDoesItServe) return whoDoesItServe.eligible_values

  }
  
}
  

export const getServiceLanguages = (state, props) => getService(state, props).Languages || [];

const timeParseRe = /(\d\d:\d\d):\d\d/;
const parseTimeString = (s) => {
  if (typeof s === 'string') {
    const m = s.match(timeParseRe);
    if (m) {
      return m[1];
    }
  }
  return null;
};

export const getServiceOpeningHours = (state, props) => (
  (getService(state, props).RegularSchedules || []).map(({
    opens_at: opensAt,
    closes_at: closesAt,
    weekday,
  }) => ({
    opensAt: parseTimeString(opensAt),
    closesAt: parseTimeString(closesAt),
    weekday: DAYS[weekday - 1],
  }))
);

export const getIrregularOpeningHours = (state, props) => (
  (getService(state, props).HolidaySchedules || []).map(({
    opens_at: opensAt,
    closes_at: closesAt,
    weekday,
    ...otherProps
  }) => ({
    ...otherProps,
    opensAt: parseTimeString(opensAt),
    closesAt: parseTimeString(closesAt),
    weekday: DAYS[weekday - 1],
  }))
);

export const getServiceAdditionalInfo = (state, props) => getService(state, props).additional_info;

export const getEventRelatedInfo = (state, props) =>
  getService(state, props).EventRelatedInfos || [];

export const getServiceTaxonomySpecificAttribute = (name, state, props) => {
  const attributes = getService(state, props).ServiceTaxonomySpecificAttributes || [];
  const attribute = attributes.find(a => (a.attribute.name === name));
  return attribute ? attribute.values : null;
};

export const getServiceHasHivNutrition = (state, props) =>
  getServiceTaxonomySpecificAttribute('hasHivNutrition', state, props);

export const getServiceTgncClothing = (state, props) =>
  getServiceTaxonomySpecificAttribute('tgncClothing', state, props);

export const getServiceClothingOccasions = (state, props) =>
  getServiceTaxonomySpecificAttribute('clothingOccasion', state, props);

export const getServiceWearerAge = (state, props) =>
  getServiceTaxonomySpecificAttribute('wearerAge', state, props);
