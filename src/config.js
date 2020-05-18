/* eslint-disable max-len */

const parseBoolean = (value, defaultValue = false) =>
  (value == null ? defaultValue : value.toLowerCase() === 'true');

export default {
  gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID || 'UA-116475051-1',
  baseApi: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  privacyUrl: process.env.PRIVACY_URL || 'https://docs.google.com/document/d/e/2PACX-1vQ8djXWiASXKkcKJ2LSHNXMgrQ1PhQPskSs_Thk5oLTZMnKvMy7Nqz1t4Xs18mGGKuORXOj8yNNhJUq/pub',
  termsOfUseUrl: process.env.TOU_URL || 'https://docs.google.com/document/d/e/2PACX-1vTBNI2Sv5QC8DSBwBL7WHNBdMI-9kPLuN2ev_Y2VDSo-bLeh8qssi7iBv-w0EEQurX9fgFQF4_2lItn/pub',
  commentGuidelinesUrl: process.env.COMMENT_GUIDELINES_URL || 'https://docs.google.com/document/d/e/2PACX-1vTi6AR2Q-PpTNMLTimvdVg8yDuLJ5DURswQ-heCToXj3OwuqNXyt-LIBs-By9znC2A_0HxqlO8vQ_DJ/pub',
  googleMaps: process.env.REACT_APP_GMAPS_URL || 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCFMDqEgQ6VWWJbROzZhHu-f6sktAmTEGU&v=3.exp&libraries=geometry,drawing,places',
  adminGroupName: process.env.REACT_APP_ADMIN_GROUP_NAME || 'StreetlivesAdmins',
  disableAuth: parseBoolean(process.env.REACT_APP_DISABLE_AUTH),
};
