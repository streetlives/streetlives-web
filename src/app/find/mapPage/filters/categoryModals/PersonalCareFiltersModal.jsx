import React from 'react';
import FilterSelector from '../FilterSelector';
import {
  openOptions,
  referralOptions,
  referralExplanation,
  clientOptions,
  clientExplanation,
} from '../commonFilters';
import { categories, selectableSubcategoryNames } from '../../../categories';

const filterSelectableSubcategories = subcategories =>
  subcategories.filter(({ name }) =>
    selectableSubcategoryNames[categories.personalCare].includes(name.toLowerCase().trim()));

const PersonalCareFiltersModal = ({
  values,
  onChange,
  category,
}) => {
  const subcategories = filterSelectableSubcategories(category.children);
  const subcategoryOptions = [
    { label: 'Any', value: null },
    ...subcategories.map(({ name, id }) =>
      ({ label: name, value: id, description: `specifically ${name.toLowerCase()}` })),
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
      <FilterSelector
        title="Referral letter"
        options={referralOptions}
        explanation={referralExplanation}
        onSelect={referralRequired => onChange({ referralRequired })}
        selectedOption={values.referralRequired}
      />
      <FilterSelector
        title="Client of the organization"
        options={clientOptions}
        explanation={clientExplanation}
        onSelect={clientsOnly => onChange({ clientsOnly })}
        selectedOption={values.clientsOnly}
      />
    </div>
  );
};

export default PersonalCareFiltersModal;
