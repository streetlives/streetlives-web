import { locationsReducer } from './locations';
import { locationErrorsReducer } from './locationErrors';
import { newLocationReducer } from './newLocation';
import { commentsReducer } from './comments';

export { selectNewLocationData } from './newLocation';
export { selectComments, selectIsPostingComment } from './comments';

export const rootReducerObj = {
  locations: locationsReducer,
  locationErrors: locationErrorsReducer,
  newLocation: newLocationReducer,
  comments: commentsReducer,
};

export default rootReducerObj;
