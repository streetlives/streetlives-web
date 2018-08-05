import {
  GET_COMMENTS_RESPONSE,
  OPTIMISTIC_POST_COMMENT,
  ROLLBACK_POST_COMMENT,
} from '../actions';

export const commentsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_COMMENTS_RESPONSE:
      return {
        ...state,
        [action.payload.locationId]: action.payload.comments,
      };

    case OPTIMISTIC_POST_COMMENT: {
      const { locationId, comment } = action.payload;
      const oldComments = state[locationId] || [];
      return {
        ...state,
        [`last/${locationId}`]: oldComments,
        [locationId]: [
          {
            content: comment.content,
            posted_by: comment.name,
            contact_info: comment.contactInfo,
          },
          ...oldComments,
        ],
      };
    }

    case ROLLBACK_POST_COMMENT:
      return {
        ...state,
        [`last/${action.payload.locationId}`]: null,
        [action.payload.locationId]: state[`last/${action.payload.locationId}`],
      };

    default:
      return state;
  }
};

export const selectComments = (state, locationId) => state.comments[locationId];
