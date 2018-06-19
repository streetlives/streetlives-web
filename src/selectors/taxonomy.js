import { getServices } from './service';

export const getTaxonomy = (state, props) => state.locations.taxonomy;

export const getCurrentCategories = (state, props) => {
  let currentCategories = {};
  const services = getServices(state, props) || [];
  services.forEach((service) => {
    service.Taxonomies.forEach((category) => {
      currentCategories = { ...currentCategories, [category.id]: true, [category.parent_id]: true };
    });
  });
  return currentCategories;
};
