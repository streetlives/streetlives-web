import FoodFiltersModal from './FoodFiltersModal';
import ClothingFiltersModal from './ClothingFiltersModal';
import PersonalCareFiltersModal from './PersonalCareFiltersModal';

import { categories } from '../../../categories';

export default {
  [categories.food]: FoodFiltersModal,
  [categories.clothing]: ClothingFiltersModal,
  [categories.personalCare]: PersonalCareFiltersModal,
};
