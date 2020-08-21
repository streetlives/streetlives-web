const options = [
  {
    label: 'None',
    values: [true, false],
  },
  {
    label: 'Client/Member only',
    values: [true],
  },
];

const getLabelByValues = (values) => {
  const selected = options.find(o => values.toString() === o.values.toString());
  return selected && selected.label;
};

export {
  options as default,
  getLabelByValues,
};
