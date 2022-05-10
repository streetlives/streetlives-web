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
  [categories.shelter]: ['single adult', 'families'],
  [categories.personalCare]: ['toiletries', 'restrooms', 'shower', 'laundry', 'haircut'],
};

export default {
  categories,
  selectableCategoryNames,
  selectableSubcategoryNames,
};
