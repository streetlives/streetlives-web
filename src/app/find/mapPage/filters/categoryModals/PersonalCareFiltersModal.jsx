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

const subcategoryNames = selectableSubcategoryNames[categories.personalCare];
const filterSelectableSubcategories = subcategories => subcategories.map(subcategory => ({
  ...subcategory,
  index: subcategoryNames.indexOf(subcategory.name.toLowerCase().trim()),
})).filter(({ index }) => index !== -1).sort((s1, s2) => s1.index - s2.index);

const PersonalCareFiltersModal = ({
  values,
  onChange,
  category,
}) => {
  const subcategories = filterSelectableSubcategories(category.children);
  const subcategoryOptions = [
    { label: 'Any services', value: null },
    ...subcategories.map(({ name, id }) =>
      ({ label: name, value: id, description: name.toLowerCase() })),
  ];

  return (
    <div>
      <FilterSelector
        title="View specific services"
        multiselect
        options={subcategoryOptions}
        onSelect={subcategoryIds => onChange({
          subcategoryIds: subcategoryIds && {
            value: subcategoryIds,
            description: `specifically ${
              subcategoryIds.map(({ description }) => description).join(' or ')}`,
          },
        })}
        selectedOption={values.subcategoryIds && values.subcategoryIds.value}
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
