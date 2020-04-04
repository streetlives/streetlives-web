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
  [categories.personalCare]: ['shower', 'toiletries', 'restrooms'],
};

export default {
  categories,
  selectableCategoryNames,
  selectableSubcategoryNames,
};
