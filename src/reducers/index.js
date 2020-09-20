import locationsReducer from './locations';
import locationErrorsReducer from './locationErrors';
import dataEntryErrorsReducer from './dataEntryErrorsReducer';
import { newLocationReducer } from './newLocation';
import { commentsReducer } from './comments';

export { selectNewLocationData } from './newLocation';
export { selectComments, selectIsPostingComment } from './comments';

export const rootReducerObj = {
  locations: locationsReducer,
  locationErrors: locationErrorsReducer,
  dataEntryErrors: dataEntryErrorsReducer,
  newLocation: newLocationReducer,
  comments: commentsReducer,
};

export default rootReducerObj;
