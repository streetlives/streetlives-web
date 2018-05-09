export const getLocationId = props => props.match.params.locationId;

export const getLocation = (state, props) => state.locations[getLocationId(props)] || {};
