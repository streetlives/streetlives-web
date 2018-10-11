import Amplify from 'aws-amplify';
import config from '../config';

const getIdToken = () => new Promise((resolve) => {
  if (config.disableAuth) {
    return resolve(null);
  }

  return Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idToken = user.signInUserSession.getIdToken();
    resolve(idToken);
  })
    .catch(() => resolve(null));
});

export const getAuthToken = () => getIdToken().then(idToken => idToken && idToken.getJwtToken());

export const getUserOrganizations = () => getIdToken()
  .then((idToken) => {
    if (!idToken) {
      return null;
    }

    const organizationsStr = idToken.payload['custom:organizations'];

    if (!organizationsStr || !organizationsStr.length) {
      return null;
    }

    return organizationsStr.split(',');
  });

export const isUserAdmin = () => getIdToken()
  .then((idToken) => {
    if (!idToken) {
      return null;
    }

    const groups = idToken.payload['cognito:groups'];

    return !!groups && groups.indexOf(config.adminGroupName) !== -1;
  });
