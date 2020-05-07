import locationsReducer from './locations';
import locationErrorsReducer from './locationErrors';
import { newLocationReducer } from './newLocation';
import { commentsReducer } from './comments';
import { errorReportsReducer } from './errorReports';

export { selectNewLocationData } from './newLocation';
export { selectComments, selectIsPostingComment } from './comments';
export { selectErrorReports, selectIsPostingErrorReport } from './errorReports';

export const rootReducerObj = {
  locations: locationsReducer,
  locationErrors: locationErrorsReducer,
  newLocation: newLocationReducer,
  comments: commentsReducer,
  errorReports: errorReportsReducer,
};

export default rootReducerObj;
