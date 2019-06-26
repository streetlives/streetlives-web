import React, { Component } from 'react';
import FiltersModal from './FiltersModal';
import FilterSelector from './FilterSelector';

const kindOptions = [
  { label: 'Any', value: null },
  { label: 'Everyday', value: 'everyday' },
  { label: 'Job interview', value: 'interview' },
];
const openOptions = [
  { label: 'Open & closed', value: null },
  { label: 'Open Now', value: true },
];
const referralOptions = [
  { label: 'Any', value: null },
  { label: 'Not required', value: false },
  { label: 'Required', value: true },
];
const clientOptions = [
  { label: 'Any', value: null },
  { label: 'Not required', value: false },
  { label: 'Required', value: true },
];

class ClothingFiltersModal extends Component {
  state = {
    filterValues: {
      clothingKind: null,
      openNow: null,
      referralLetter: null,
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
          selectedValue={filterValues.clothingKind}
        />
        <FilterSelector
          title="Opening hours"
          options={openOptions}
          onSelect={openNow => this.setFilterValues({ openNow })}
          selectedValue={filterValues.openNow}
        />
        <FilterSelector
          title="Referral letter"
          options={referralOptions}
          onSelect={referralLetter => this.setFilterValues({ referralLetter })}
          selectedValue={filterValues.referralLetter}
        />
        <FilterSelector
          title="Client of the organization"
          options={clientOptions}
          onSelect={clientsOnly => this.setFilterValues({ clientsOnly })}
          selectedValue={filterValues.clientsOnly}
        />
      </FiltersModal>
    );
  }
}

export default ClothingFiltersModal;
