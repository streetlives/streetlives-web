import { locationsReducer } from './locations';

export { selectLocationData } from './locations';

export const rootReducerObj = {
  locations: locationsReducer,
};

export default rootReducerObj;
