import { locationsReducer, locationErrorsReducer } from './locations';
import { newLocationReducer } from './newLocation';
import { commentsReducer } from './comments';

export { selectLocationData, selectLocationError } from './locations';
export { selectNewLocationData } from './newLocation';
export { selectComments, selectIsPostingComment } from './comments';

export const rootReducerObj = {
  locations: locationsReducer,
  locationErrors : locationErrorsReducer,
  newLocation: newLocationReducer,
  comments: commentsReducer,
};

export default rootReducerObj;
