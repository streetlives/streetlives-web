import React from 'react';

const formatGender = (values) => {
  if (values.length !== 1) {
    return null;
  }

  return `Serves only ${values[0].toLowerCase() === 'female' ? 'women' : 'men'}`;
};

const formatAge = (values) => {
  const ageGroups = {
    '18-24': 'Youth',
    '13-19': 'Teens',
  };

  return values.map(value =>
    (ageGroups[value] ? `${ageGroups[value]}: ${value}` : `Age: ${value}`)).join(', ');
};

const formatMembership = values => (
  (values.length === 1 && values[0] === 'true') ?
    'Only serves people who are clients of the organization' :
    null
);

const formatLanguageSpoken = values => `Language required: ${values.join(', ')}`;

const formatOrientation = values => (
  (values.length === 1 && values[0] === 'true') ?
    'Serves LGBTQ+ people' :
    null
);

const formatCommunicableDisease = values => (
  (values.length === 1 && values[0] === 'true') ?
    'Serves PLWHA' :
    null
);

const paramFormatters = {
  general: () => null,
  gender: formatGender,
  age: formatAge,
  membership: formatMembership,
  languageSpoken: formatLanguageSpoken,
  orientation: formatOrientation,
  communicableDisease: formatCommunicableDisease,
};

const formatEligibility = (paramName, values) => {
  const formatter = paramFormatters[paramName];
  if (formatter) {
    return formatter(values);
  }
  return `Serves ${values.join(', ')}`;
};

const formatDocument = (document) => {
  const documentDescriptions = {
    'photo id': 'photo ID',
    'referral letter': 'a referral letter to be served',
  };

  const documentName = document.document;
  return `Requires ${documentDescriptions[documentName.toLowerCase()] || documentName}`;
};

const ServiceRestrictions = ({ eligibilities, requiredDocuments }) => (
  <div>
    {eligibilities && eligibilities.map(eligibility => (
      <div key={eligibility.id}>
        {formatEligibility(eligibility.EligibilityParameter.name, eligibility.eligible_values)}
      </div>
    ))}
    {requiredDocuments && requiredDocuments.map(document => (
      <div key={document.id}>{formatDocument(document)}</div>
    ))}
  </div>
);

export default ServiceRestrictions;
