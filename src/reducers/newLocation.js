import {
  START_CREATING_NEW_LOCATION,
  DONE_CREATING_NEW_LOCATION,
} from '../actions';

export const newLocationReducer = (state = {}, action) => {
  switch (action.type) {
    case START_CREATING_NEW_LOCATION:
      if (action.payload) {
        return {
          address: action.payload.address,
          position: action.payload.position,
        };
      }
      break;

    case DONE_CREATING_NEW_LOCATION:
      return {};

    default:
      return state;
  }

  return state;
};

export const selectNewLocationData = state => state.newLocation;
