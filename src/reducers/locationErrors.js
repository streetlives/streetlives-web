import {
  GET_LOCATION_REQUEST,
  GET_LOCATION_ERROR,
} from '../actions';

const locationErrorsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_LOCATION_REQUEST:
      return { ...state, [action.locationId]: null };
    case GET_LOCATION_ERROR:
      return { ...state, [action.locationId]: action.errorMessage };
    default:
      break;
  }
  return state;
};

export default locationErrorsReducer;
