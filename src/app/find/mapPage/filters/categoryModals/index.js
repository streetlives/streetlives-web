import FoodFiltersModal from './FoodFiltersModal';
import ClothingFiltersModal from './ClothingFiltersModal';
import PersonalCareFiltersModal from './PersonalCareFiltersModal';
import ShelterFiltersModal from './ShelterFiltersModal';

import { categories } from '../../../categories';

export default {
  [categories.food]: FoodFiltersModal,
  [categories.clothing]: ClothingFiltersModal,
  [categories.personalCare]: PersonalCareFiltersModal,
  [categories.shelter]: ShelterFiltersModal,
};
