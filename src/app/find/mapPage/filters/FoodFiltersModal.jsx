import React, { Component } from 'react';
import Checkbox from '../../../../components/checkbox';
import FiltersModal from './FiltersModal';
import FilterSelector from './FilterSelector';
import { openOptions } from './commonFilters';
import { categories, selectableSubcategoryNames } from '../categories';

const filterSelectableSubcategories = subcategories =>
  subcategories.filter(({ name }) =>
    selectableSubcategoryNames[categories.food].includes(name.toLowerCase().trim()));

class FoodFiltersModal extends Component {
  state = {
    filterValues: {
      subcategoryId: null,
      hivNutrition: null,
      openNow: null,
      ...this.props.defaultValues,
    },
  };

  setFilterValues = values => this.setState({
    filterValues: {
      ...this.state.filterValues,
      ...values,
    },
  });

  submit = () => {
    this.props.onSubmit(this.state.filterValues);
  };

  render() {
    const { onClose, category } = this.props;
    const { filterValues } = this.state;

    const subcategories = filterSelectableSubcategories(category.children);
    const subcategoryOptions = [
      { label: 'Any', value: null },
      ...subcategories.map(({ name, id }) =>
        ({ label: name, value: id, description: `have a ${name.toLowerCase()}` })),
    ];

    return (
      <FiltersModal
        title="Food Filters"
        onSubmit={this.submit}
        onClose={onClose}
      >
        <FilterSelector
          title="Kind"
          options={subcategoryOptions}
          onSelect={subcategoryId => this.setFilterValues({ subcategoryId })}
          selectedOption={filterValues.subcategoryId}
        />
        <div className="border-bottom text-left py-2 px-3">
          <Checkbox
            name="hivNutrition"
            label="Must have HIV+ nutrition"
            onChange={checked => this.setFilterValues({
              hivNutrition: checked ? { value: true, description: 'have HIV+ nutrition' } : null,
            })}
            checked={!!filterValues.hivNutrition}
          />
        </div>
        <FilterSelector
          title="Opening hours"
          options={openOptions}
          onSelect={openNow => this.setFilterValues({ openNow })}
          selectedOption={filterValues.openNow}
        />
      </FiltersModal>
    );
  }
}

export default FoodFiltersModal;
