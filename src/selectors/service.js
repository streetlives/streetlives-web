import { getLocation } from './location';

export const getServiceId = props => props.match.params.serviceId;

export const getTaxonomy = (state, props) => state.locations.taxonomy;

export const getServices = (state, props) => getLocation(state, props).Services || [];

export const getService = (state, props) => {
  const serviceId = getServiceId(props);
  const services = getServices(state, props);
  return services.filter(el => el.id === serviceId)[0] || {};
};

export const getServiceDescription = (state, props) => getService(state, props).description;
