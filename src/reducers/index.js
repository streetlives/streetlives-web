import { dbReducer } from './db';

export { selectLocationData } from './db';

export const rootReducerObj = {
  db: dbReducer,
};

export default rootReducerObj;
