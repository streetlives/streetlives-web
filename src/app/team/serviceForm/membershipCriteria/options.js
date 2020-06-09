const options = [
  {
    label: 'None',
    values: [true, false],
  },
  {
    label: 'Referal Letter',
    requiredDocument: 'referral letter',
    values: [true, false],
  },
  {
    label: 'Client/member only',
    values: [true],
  },
];

const getLabelByValues = (values) => {
  const selected = options.find(o => values.toString() === o.values.toString());
  return selected && selected.label;
};

const getRequiredDocument = (values) => {
  const selected = options.find(o => values.toString() === o.values.toString());
  return selected && selected.requiredDocument;
};

export {
  options as default,
  getLabelByValues,
  getRequiredDocument,
};
