import { locationsReducer } from './locations';
import { newLocationReducer } from './newLocation';

export { selectLocationData } from './locations';
export { selectNewLocationData } from './newLocation';

export const rootReducerObj = {
  locations: locationsReducer,
  newLocation: newLocationReducer,
};

export default rootReducerObj;
