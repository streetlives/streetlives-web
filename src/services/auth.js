import { fetchAuthSession } from 'aws-amplify/auth';
import config from '../config';

const getIdToken = () => {
  if (config.disableAuth) {
    return Promise.resolve(null);
  }

  return fetchAuthSession()
    .then(({ tokens }) => (tokens ? tokens.idToken : null))
    .catch(() => null);
};

export const getAuthToken = () => getIdToken().then(idToken => idToken && idToken.toString());

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
