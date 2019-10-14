import React from 'react';
import Checkbox from '../../../../../components/checkbox';
import FilterSelector from '../FilterSelector';
import { openOptions } from '../commonFilters';
import { categories, selectableSubcategoryNames } from '../../../categories';

const filterSelectableSubcategories = subcategories =>
  subcategories.filter(({ name }) =>
    selectableSubcategoryNames[categories.food].includes(name.toLowerCase().trim()));

const FoodFiltersModal = ({
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
      <div className="border-bottom text-left py-2 px-3">
        <Checkbox
          name="hivNutrition"
          label="Must have HIV+ nutrition"
          onChange={checked => onChange({
            hivNutrition: checked ? { value: true, description: 'have HIV+ nutrition' } : null,
          })}
          checked={!!values.hivNutrition}
        />
      </div>
      <FilterSelector
        title="Opening hours"
        options={openOptions}
        onSelect={openNow => onChange({ openNow })}
        selectedOption={values.openNow}
      />
    </div>
  );
};

export default FoodFiltersModal;
