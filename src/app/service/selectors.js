export const getLocation = (state, props) => state.locations[props.match.params.locationId] || {};

export const getTaxonomy = (state, props) => state.locations.taxonomy;

export const getServices = (state, props) => getLocation(state, props).Services || [];

export const getService = (state, props) => {
  const { serviceId } = props.match.params;
  const services = getServices(state, props);
  return services.filter(el => el.id === serviceId)[0] || {};
};

export const getCurrentCategories = (state, props) => {
  let currentCategories = {};
  const services = getServices(state, props) || [];
  services.forEach((service) => {
    service.Taxonomies.forEach((category) => {
      currentCategories = { ...currentCategories, [category.id]: category };
    });
  });
  return currentCategories;
};
