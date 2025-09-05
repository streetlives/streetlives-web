/* eslint-disable max-len */
import assert from 'assert';

assert.ok(process.env.REACT_APP_GMAPS_API_KEY, 'REACT_APP_GMAPS_API_KEY is not set');

const parseBoolean = (value, defaultValue = false) =>
  (value == null ? defaultValue : value.toLowerCase() === 'true');

export default {
  gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID || 'G-8YQSKLWB8R',
  baseApi: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  privacyUrl: process.env.PRIVACY_URL || 'https://docs.google.com/document/d/e/2PACX-1vQ8djXWiASXKkcKJ2LSHNXMgrQ1PhQPskSs_Thk5oLTZMnKvMy7Nqz1t4Xs18mGGKuORXOj8yNNhJUq/pub',
  termsOfUseUrl: process.env.TOU_URL || 'https://docs.google.com/document/d/e/2PACX-1vTBNI2Sv5QC8DSBwBL7WHNBdMI-9kPLuN2ev_Y2VDSo-bLeh8qssi7iBv-w0EEQurX9fgFQF4_2lItn/pub',
  commentGuidelinesUrl: process.env.COMMENT_GUIDELINES_URL || 'https://docs.google.com/document/d/e/2PACX-1vTi6AR2Q-PpTNMLTimvdVg8yDuLJ5DURswQ-heCToXj3OwuqNXyt-LIBs-By9znC2A_0HxqlO8vQ_DJ/pub',
  feedbackEmail: process.env.FEEDBACK_EMAIL || 'gogetta@streetlives.nyc',
  googleMaps: process.env.REACT_APP_GMAPS_URL || `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GMAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
  googleMapApiKey: process.env.REACT_APP_GMAPS_API_KEY || null,
  adminGroupName: process.env.REACT_APP_ADMIN_GROUP_NAME || 'StreetlivesAdmins',
  disableAuth: parseBoolean(process.env.REACT_APP_DISABLE_AUTH),
  mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN || '8dd3b51f7a1de357a05e954495ae616f',
  sentryDsn: 'https://f7a71e0f6282e1a79ba6f604080ec88e@o4507232810631168.ingest.us.sentry.io/4507235352313856',
};
