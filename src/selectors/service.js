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

export const getServiceDescription = (state, props) => getService(state, props).description;

export const getServiceAgesServed = (state, props) => getService(state, props).ages_served;

export const getServiceTaxonomy = (state, props) => (
  getService(state, props).Taxonomies &&
  getService(state, props).Taxonomies[0].parent_name
);

export const getServiceWhoDoesItServe = (state, props) =>
  getService(state, props).who_does_it_serve;

export const getServiceWhatKindOfClothing = (state, props) =>
  getService(state, props).what_kind_of_clothing;

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
  const attribute = attributes.find(a => (a.attribute.name === name)) || {};
  return attribute.values;
};

export const getServiceProofsRequired = (state, props) =>
  getService(state, props).RequiredDocuments || [];

export const getServiceHasHivNutrition = (state, props) =>
  getServiceTaxonomySpecificAttribute('hasHivNutrition', state, props);

export const getServiceTgncClothing = (state, props) =>
  getServiceTaxonomySpecificAttribute('tgncClothing', state, props);

export const getServiceClothingOccasions = (state, props) =>
  getServiceTaxonomySpecificAttribute('clothingOccasion', state, props);

export const getServiceWearerAge = (state, props) =>
  getServiceTaxonomySpecificAttribute('wearerAge', state, props);
