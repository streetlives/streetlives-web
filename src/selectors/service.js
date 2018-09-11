import { getLocation } from './location';
import { DAYS } from '../constants';

export const getServiceId = props => props.match.params.serviceId;

export const getTaxonomy = (state, props) => state.locations.taxonomy;

export const getServices = (state, props) => (getLocation(state, props) || {}).Services || [];

export const getService = (state, props) => {
  const serviceId = getServiceId(props);
  const services = getServices(state, props);
  return services.filter(el => el.id === serviceId)[0] || {};
};

export const getServiceDescription = (state, props) => getService(state, props).description;

export const getServiceAgesServed = (state, props) => getService(state, props).ages_served;

export const getServiceWhoDoesItServe = (state, props) =>
  getService(state, props).who_does_it_serve;

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

export const getServiceAdditionalInfo = (state, props) => getService(state, props).additional_info;
