import {
  GET_ERROR_REPORT_RESPONSE,
  POST_ERROR_REPORT_REQUEST,
  POST_ERROR_REPORT_SUCCESS,
  POST_ERROR_REPORT_ERROR,
  DELETE_ERROR_REPORT_REQUEST,
  // DELETE_ERROR_REPORT_SUCCESS, // deletion rolled back if error only
  DELETE_ERROR_REPORT_ERROR,
} from '../actions';

export const errorReportsReducer = (state = { isPosting: false }, action) => {
  switch (action.type) {
    case GET_ERROR_REPORT_RESPONSE:
      return {
        ...state,
        [action.payload.locationId]: action.payload.errorReports,
      };

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

    case DELETE_ERROR_REPORT_REQUEST: {
      const { locationId, errorReport } = action.payload;
      const errorReports = state[locationId] || [];
      const errorReportIndex = errorReports.indexOf(errorReport);

      if (errorReportIndex === -1) {
        return state;
      }

      return {
        ...state,
        [`last/${locationId}`]: errorReports,
        [locationId]: [
          ...errorReports.slice(0, errorReportIndex),
          ...errorReports.slice(errorReportIndex + 1),
        ],
      };
    }

    case DELETE_ERROR_REPORT_ERROR:
      return {
        ...state,
        [`last/${action.payload.locationId}`]: null,
        [action.payload.locationId]: state[`last/${action.payload.locationId}`],
      };

    default:
      return state;
  }
};

export const selectErrorReports = (state, locationId) => state.errorReports[locationId];
export const selectIsPostingErrorReport = state => state.errorReports.isPosting;
