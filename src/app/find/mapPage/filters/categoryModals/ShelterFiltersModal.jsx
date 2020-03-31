import React from 'react';
import FilterSelector from '../FilterSelector';
import { openOptions } from '../commonFilters';
import { categories, selectableSubcategoryNames } from '../../../categories';

const filterSelectableSubcategories = subcategories =>
  subcategories.filter(({ name }) =>
    selectableSubcategoryNames[categories.shelter].includes(name.toLowerCase().trim()));

const ShelterFiltersModal = ({
  values,
  onChange,
  category,
}) => {
  const subcategories = filterSelectableSubcategories(category.children);
  const subcategoryOptions = [
    { label: 'Any', value: null },
    ...subcategories.map(({ name, id }) =>
      ({ label: name, value: id, description: `have a ${name.toLowerCase()}` })),
  ];

  return (
    <div>
      <FilterSelector
        title="Kind"
        options={subcategoryOptions}
        onSelect={subcategoryId => onChange({ subcategoryId })}
        selectedOption={values.subcategoryId}
      />
      <FilterSelector
        title="Opening hours"
        options={openOptions}
        onSelect={openNow => onChange({ openNow })}
        selectedOption={values.openNow}
      />
    </div>
  );
};

export default ShelterFiltersModal;
