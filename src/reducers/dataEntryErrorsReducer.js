import {
  UPDATE_LOCATION_ERROR,
  UPDATE_SERVICE_ERROR,
  DISMISS_DATA_ENTRY_ERRORS,
} from '../actions';
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: "https://f7a71e0f6282e1a79ba6f604080ec88e@o4507232810631168.ingest.us.sentry.io/4507235352313856",
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/(test.)?gogetta.nyc\/team/],
  // Session Replay
  replaysSessionSampleRate: 1, 
  replaysOnErrorSampleRate: 1,
});

const locationErrorsReducer = (state = [], action) => {
  switch (action.type) {
    case UPDATE_LOCATION_ERROR:
    case UPDATE_SERVICE_ERROR:
      if (!action.payload || !action.payload.error) {
        return state;
      }
      const extra = {
        response: {
          payload: action.payload.error.response.data,
          ...action.payload.error.response,
        }
      }
      Sentry.captureException(action.payload.error, {
        contexts: extra,
        extra: extra,
      });
      return [action.payload.error, ...state];

    case DISMISS_DATA_ENTRY_ERRORS:
      return [];

    default:
      return state;
  }
};

export default locationErrorsReducer;
