import { locationsReducer } from './locations';
import { newLocationReducer } from './newLocation';
import { commentsReducer } from './comments';

export { selectLocationData } from './locations';
export { selectNewLocationData } from './newLocation';
export { selectComments } from './comments';

export const rootReducerObj = {
  locations: locationsReducer,
  newLocation: newLocationReducer,
  comments: commentsReducer,
};

export default rootReducerObj;
