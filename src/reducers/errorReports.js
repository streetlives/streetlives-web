import {
  POST_ERROR_REPORT_REQUEST,
  POST_ERROR_REPORT_SUCCESS,
  POST_ERROR_REPORT_ERROR,
} from '../actions';

export const errorReportsReducer = (state = { isPosting: false }, action) => {
  switch (action.type) {
    case POST_ERROR_REPORT_REQUEST:
      return {
        ...state,
        isPosting: true,
      };

    case POST_ERROR_REPORT_SUCCESS: {
      const { locationId, errorReport } = action.payload;
      const oldErrorReports = state[locationId] || [];
      return {
        ...state,
        [locationId]: [
          errorReport,
          ...oldErrorReports,
        ],
        isPosting: false,
      };
    }

    case POST_ERROR_REPORT_ERROR:
      return {
        ...state,
        isPosting: false,
      };

    default:
      return state;
  }
};

export const selectErrorReports = (state, locationId) => state.errorReports[locationId];
export const selectIsPostingErrorReport = state => state.errorReports.isPosting;
