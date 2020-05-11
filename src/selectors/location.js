const selectLocationId = props => props.match.params.locationId;

export const selectLocationData = (state, props) => state.locations[selectLocationId(props)];

export const selectOriginalLocationData = (state, props) =>
  state.locations[`original/${selectLocationId(props)}`] || {};

export const selectLocationError = (state, props) => state.locationErrors[selectLocationId(props)];

export const selectEventRelatedInfo = (state, props) =>
  (selectLocationData(state, props) || {}).EventRelatedInfos || [];

export const getPhoneNumbers = (state, props) =>
  selectLocationData(state, props) && selectLocationData(state, props).Phones;

export const getPhoneNumber = (state, props) => {
  const phoneNumbers = getPhoneNumbers(state, props);

  if (phoneNumbers && phoneNumbers.length) {
    return phoneNumbers.find(x => x.id === props.match.params.phoneId);
  }

  return null;
};
