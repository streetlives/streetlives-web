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

export default {
  categories,
  selectableCategoryNames,
  selectableSubcategoryNames,
};
