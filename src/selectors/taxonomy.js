import { getServices } from './service';

export const getTaxonomy = (state, props) => state.locations.taxonomy;

export const getCurrentCategories = (state, props) => {
  let currentCategories = {};
  const services = getServices(state, props) || [];
  services.forEach((service) => {
    service.Taxonomies.forEach((category) => {
      const current = currentCategories[category.id] || [];
      currentCategories = {
        ...currentCategories,
        [category.id]: [...current, service],
      };
    });
  });
  return currentCategories;
};

export const getTaxonomyForLocation = (state, props) => {
  const taxonomy = getTaxonomy(state, props) || [];
  const currentCategories = getCurrentCategories(state, props);
  return taxonomy.map((parent) => {
    const addedServices = currentCategories[parent.id] || [];
    return { ...parent, children: [...parent.children, ...addedServices] };
  });
};
