export const categories = {
  food: 'food',
  clothing: 'clothing',
  personalCare: 'personal care',
  shelter: 'shelter',
};

export const selectableCategoryNames = [
  categories.food,
  categories.clothing,
  categories.personalCare,
  categories.shelter,
];

export const selectableSubcategoryNames = {
  [categories.food]: ['soup kitchen', 'food pantry'],
};

export default {
  categories,
  selectableCategoryNames,
  selectableSubcategoryNames,
};
