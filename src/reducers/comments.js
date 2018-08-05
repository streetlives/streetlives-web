import { GET_COMMENTS_RESPONSE } from '../actions';

export const commentsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_COMMENTS_RESPONSE:
      return {
        ...state,
        [action.payload.locationId]: action.payload.comments,
      };

    default:
      return state;
  }
};

export const selectComments = (state, locationId) => state.comments[locationId];
