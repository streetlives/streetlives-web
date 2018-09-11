export const getLocationId = props => props.match.params.locationId;

export const getLocation = (state, props) => state.locations[getLocationId(props)];

export const getLocationError = (state, props) => state.locationErrors[getLocationId(props)];
