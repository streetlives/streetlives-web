import {
  GET_COMMENTS_RESPONSE,
  OPTIMISTIC_POST_COMMENT,
  POST_COMMENT_ERROR,
  POST_COMMENT_SUCCESS,
  POST_REPLY_REQUEST,
  POST_REPLY_SUCCESS,
  POST_REPLY_ERROR,
  DELETE_REPLY_REQUEST,
  DELETE_REPLY_ERROR,
  REMOVE_COMMENT_REQUEST,
  REMOVE_COMMENT_ERROR,
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

    case POST_COMMENT_ERROR:
      return {
        ...state,
        [`last/${action.payload.locationId}`]: null,
        [action.payload.locationId]: state[`last/${action.payload.locationId}`],
        isPosting: false,
      };

    case POST_REPLY_REQUEST: {
      return {
        ...state,
        isPosting: true,
      };
    }

    case POST_REPLY_SUCCESS: {
      const { locationId, originalCommentId, reply } = action.payload;

      const comments = state[locationId] || [];
      const originalComment =
        comments.filter(comment => comment.id === originalCommentId)[0];

      if (!originalComment) {
        return {
          ...state,
          isPosting: false,
        };
      }

      const originalCommentIndex = comments.indexOf(originalComment);
      const updatedComments = comments.slice();
      updatedComments[originalCommentIndex] = {
        ...originalComment,
        Replies: [reply],
      };
      return {
        ...state,
        [locationId]: updatedComments,
        isPosting: false,
      };
    }

    case POST_REPLY_ERROR:
      return {
        ...state,
        isPosting: false,
      };

    case DELETE_REPLY_REQUEST: {
      const { locationId, originalCommentId } = action.payload;
      const comments = state[locationId] || [];
      const originalComment =
        comments.filter(comment => comment.id === originalCommentId)[0];

      if (!originalComment) {
        return state;
      }

      const originalCommentIndex = comments.indexOf(originalComment);
      const updatedComments = comments.slice();
      updatedComments[originalCommentIndex] = {
        ...originalComment,
        Replies: [],
      };

      return {
        ...state,
        [`last/${locationId}`]: comments,
        [locationId]: updatedComments,
      };
    }

    case REMOVE_COMMENT_REQUEST: {
      const { locationId, comment } = action.payload;
      const comments = state[locationId] || [];
      const commentIndex = comments.indexOf(comment);

      if (commentIndex === -1) {
        return state;
      }

      return {
        ...state,
        [`last/${locationId}`]: comments,
        [locationId]: [...comments.slice(0, commentIndex), ...comments.slice(commentIndex + 1)],
      };
    }

    case DELETE_REPLY_ERROR:
    case REMOVE_COMMENT_ERROR:
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

export const selectIsPostingComment = state => state.comments.isPosting;
