import dbReducer from './db';

export const selectLocationData = (state, locationId) => state.db[locationId];

export const rootReducerObj = {
  db: dbReducer,
};

export default rootReducerObj;
