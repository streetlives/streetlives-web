import _ from 'underscore';

// TODO: Split up this file.
const dbReducer = (state = {}, action) => {
  switch (action.type) {
    case 'GET_LOCATION_RESPONSE':
      if (action.payload) {
        return _.extend({ [action.payload.id]: action.payload }, state);
      }
      break;
    default:
      return state;
  }

  return state;
};

export const selectLocationData = (state, locationId) => state.db[locationId];

export const rootReducerObj = {
  db: dbReducer,
};

export default rootReducerObj;
