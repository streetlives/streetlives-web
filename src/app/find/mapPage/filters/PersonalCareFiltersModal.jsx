import React, { Component } from 'react';
import FiltersModal from './FiltersModal';
import FilterSelector from './FilterSelector';
import {
  openOptions,
  referralOptions,
  referralExplanation,
  clientOptions,
  clientExplanation,
} from './commonFilters';

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
          selectedOption={filterValues.openNow}
        />
        <FilterSelector
          title="Referral letter"
          options={referralOptions}
          explanation={referralExplanation}
          onSelect={referralRequired => this.setFilterValues({ referralRequired })}
          selectedOption={filterValues.referralRequired}
        />
        <FilterSelector
          title="Client of the organization"
          options={clientOptions}
          explanation={clientExplanation}
          onSelect={clientsOnly => this.setFilterValues({ clientsOnly })}
          selectedOption={filterValues.clientsOnly}
        />
      </FiltersModal>
    );
  }
}

export default PersonalCareFiltersModal;
