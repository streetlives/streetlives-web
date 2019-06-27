import React, { Component } from 'react';
import FiltersModal from './FiltersModal';
import FilterSelector from './FilterSelector';
import { openOptions, referralOptions, clientOptions } from './commonFilters';

class PersonalCareFiltersModal extends Component {
  state = {
    filterValues: {
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
        title="Personal Care Filters"
        onSubmit={this.submit}
        onClose={onClose}
      >
        <FilterSelector
          title="Opening hours"
          options={openOptions}
          onSelect={openNow => this.setFilterValues({ openNow })}
          selectedValue={filterValues.openNow}
        />
        <FilterSelector
          title="Referral letter"
          options={referralOptions}
          onSelect={referralRequired => this.setFilterValues({ referralRequired })}
          selectedValue={filterValues.referralRequired}
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

export default PersonalCareFiltersModal;
