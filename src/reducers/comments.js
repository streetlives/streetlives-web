import {
  GET_COMMENTS_RESPONSE,
  OPTIMISTIC_POST_COMMENT,
  ROLLBACK_POST_COMMENT,
  POST_COMMENT_SUCCESS,
} from '../actions';

export const commentsReducer = (state = { isPosting: false }, action) => {
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
            id: 'temp',
            content: comment.content,
            created_at: new Date(),
          },
          ...oldComments,
        ],
        isPosting: true,
      };
    }

    case POST_COMMENT_SUCCESS:
      return {
        ...state,
        isPosting: false,
      };

    case ROLLBACK_POST_COMMENT:
      return {
        ...state,
        [`last/${action.payload.locationId}`]: null,
        [action.payload.locationId]: state[`last/${action.payload.locationId}`],
        isPosting: false,
      };

    default:
      return state;
  }
};

export const selectComments = (state, locationId) => state.comments[locationId];

export const selectIsPostingComment = state => state.comments.isPosting;
