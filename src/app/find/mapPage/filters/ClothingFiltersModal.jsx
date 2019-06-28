import React, { Component } from 'react';
import FiltersModal from './FiltersModal';
import FilterSelector from './FilterSelector';
import { openOptions, referralOptions, clientOptions } from './commonFilters';

const kindOptions = [
  { label: 'Any', value: null },
  { label: 'Everyday', value: 'everyday', description: 'for everyday use' },
  { label: 'Job interview', value: 'interview', description: 'for interviews' },
];

class ClothingFiltersModal extends Component {
  state = {
    filterValues: {
      clothingKind: null,
      openNow: null,
      referralRequired: null,
      clientsOnly: null,
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
    const { onClose } = this.props;
    const { filterValues } = this.state;

    return (
      <FiltersModal
        title="Clothing Filters"
        onSubmit={this.submit}
        onClose={onClose}
      >
        <FilterSelector
          title="Kind"
          options={kindOptions}
          onSelect={clothingKind => this.setFilterValues({ clothingKind })}
          selectedOption={filterValues.clothingKind}
        />
        <FilterSelector
          title="Opening hours"
          options={openOptions}
          onSelect={openNow => this.setFilterValues({ openNow })}
          selectedOption={filterValues.openNow}
        />
        <FilterSelector
          title="Referral letter"
          options={referralOptions}
          onSelect={referralRequired => this.setFilterValues({ referralRequired })}
          selectedOption={filterValues.referralRequired}
        />
        <FilterSelector
          title="Client of the organization"
          options={clientOptions}
          onSelect={clientsOnly => this.setFilterValues({ clientsOnly })}
          selectedOption={filterValues.clientsOnly}
        />
      </FiltersModal>
    );
  }
}

export default ClothingFiltersModal;
