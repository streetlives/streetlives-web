export const getLocationId = props => props.match.params.locationId;

export const getLocation = (state, props) => state.locations[getLocationId(props)] || {};

export const getOriginalLocation = (state, props) => state.locations[`original/${getLocationId(props)}`] || {};
