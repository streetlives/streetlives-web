const selectLocationId = props => props.match.params.locationId;

export const selectLocationData = (state, props) => state.locations[selectLocationId(props)];

export const selectLocationError = (state, props) => state.locationErrors[selectLocationId(props)];
