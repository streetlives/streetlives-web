import * as Sentry from '@sentry/browser';

import config from '../config';

Sentry.init({
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  dsn: config.sentryDsn,
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/(((test)|(www)).)?gogetta.nyc\/team/,
  ],
});