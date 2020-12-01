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
  [categories.personalCare]: ['toiletries', 'restrooms', 'shower', 'laundry', 'haircut'],
};

export default {
  categories,
  selectableCategoryNames,
  selectableSubcategoryNames,
};
