/* eslint-disable max-len */
export default {
  gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID || 'UA-116475051-1',
  baseApi: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  googleMaps: process.env.REACT_APP_GMAPS_URL || 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCFMDqEgQ6VWWJbROzZhHu-f6sktAmTEGU&v=3.exp&libraries=geometry,drawing,places',
  aws: {
    Auth: {
      // REQUIRED - Amazon Cognito Identity Pool ID
      identityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID
        || 'us-east-1:fbb09891-723a-48db-80ac-facd1ca9ec4b',
      // REQUIRED - Amazon Cognito Region
      region: 'us-east-1',
      userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID || 'us-east-1_EvBbozIjd',
      userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_CLIENT_ID
        || 'kpd58387a2f9e4fe1d42sfd1q',
    },
  },
};
