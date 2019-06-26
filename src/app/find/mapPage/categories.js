import filters from './filters';

const categories = {
  food: 'food',
  clothing: 'clothing',
  personalCare: 'personal care',
};

export const selectableCategoryNames = [
  categories.food,
  categories.clothing,
  categories.personalCare,
];

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
  selectableCategoryNames,
  getFilterModalForCategory,
};
