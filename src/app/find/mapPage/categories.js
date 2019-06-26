import filters from './filters';

export const categories = {
  food: 'food',
  clothing: 'clothing',
  personalCare: 'personal care',
};

export const selectableCategoryNames = [
  categories.food,
  categories.clothing,
  categories.personalCare,
];

export const selectableSubcategoryNames = {
  [categories.food]: ['soup kitchen', 'food pantry'],
};

const categoryFilterModals = {
  [categories.food]: filters.FoodFiltersModal,
  [categories.clothing]: filters.ClothingFiltersModal,
  [categories.personalCare]: filters.PersonalCareFiltersModal,
};

export const getFilterModalForCategory = (category) => {
  const name = category.name.trim().toLowerCase();
  return categoryFilterModals[name];
};

export default {
  categories,
  selectableCategoryNames,
  selectableSubcategoryNames,
  getFilterModalForCategory,
};
