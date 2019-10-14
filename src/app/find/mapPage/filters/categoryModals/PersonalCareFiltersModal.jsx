import React from 'react';
import FilterSelector from '../FilterSelector';
import {
  openOptions,
  referralOptions,
  referralExplanation,
  clientOptions,
  clientExplanation,
} from '../commonFilters';

const PersonalCareFiltersModal = ({ values, onChange }) => (
  <div>
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

export default PersonalCareFiltersModal;
