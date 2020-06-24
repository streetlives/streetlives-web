export const options = [
  {
    label: 'Men',
    wearerAge: ['men', 'adults'],
    gender: 'male',
  },
  {
    label: 'Women',
    wearerAge: ['women', 'adults'],
    gender: 'female',
  },
  {
    label: 'Girls',
    wearerAge: ['girls', 'children'],
  },
  {
    label: 'Boys',
    wearerAge: ['boys', 'children'],
  },
];

const uniq = array => [...new Set(array)];
const flat = array => [].concat(...array);

export const getWearerAgeFromOptions = labels =>
  uniq(flat(options.filter(o => labels.includes(o.label)).map(o => o.wearerAge)));

export const getGenderFromOptions = labels =>
  uniq(options.filter(o => labels.includes(o.label)).map(o => o.gender));

export const getLabelsFromWearerAge = (wearerAge = []) =>
  options.filter(o => wearerAge.includes(o.wearerAge[0])).map(o => o.label);
