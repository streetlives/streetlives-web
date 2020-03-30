import React from 'react';
import FilterSelector from '../FilterSelector';
import { openOptions } from '../commonFilters';

const ShelterFiltersModal = ({
  values,
  onChange,
  category,
}) => (
  <div>
    <FilterSelector
      title="Opening hours"
      options={openOptions}
      onSelect={openNow => onChange({ openNow })}
      selectedOption={values.openNow}
    />
  </div>
);

export default ShelterFiltersModal;
