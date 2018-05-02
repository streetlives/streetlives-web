import axios from 'axios';
import Amplify from 'aws-amplify';
import config from '../config';

export const getLocations = ({
  latitude, longitude, radius, searchString,
}) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios
      .request({
        url: `${config.baseApi}/locations`,
        method: 'get',
        params: {
          latitude,
          longitude,
          radius,
          searchString,
        },
        headers: {
          Authorization: idJwtToken,
        },
      })
      .then(result => result.data);
  });

export const getLocation = ({ id }) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios.request({
      url: `${config.baseApi}/locations/${id}`,
      method: 'get',
      headers: {
        Authorization: idJwtToken,
      },
    });
  });

const updateResource = ({ pathPrefix, method, pathSuffix }, { id, params }) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();

    // construct the path
    const pathComponents = [config.baseApi, pathPrefix, id];
    if (pathSuffix) pathComponents.push(pathSuffix);
    const url = pathComponents.join('/');

    return axios.request({
      url,
      method,
      data: params,
      headers: {
        Authorization: idJwtToken,
      },
    });
  });

export const getTaxonomy = () =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const jwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios.request({
      url: `${config.baseApi}/taxonomy`,
      method: 'get',
      headers: {
        Authorization: jwtToken,
      },
    });
  });

export const updateLocation = updateResource.bind(this, {
  pathPrefix: 'locations',
  method: 'patch',
});
export const updatePhone = updateResource.bind(this, { pathPrefix: 'phones', method: 'patch' });
export const createPhone = updateResource.bind(this, {
  pathPrefix: 'locations',
  method: 'post',
  pathSuffix: 'phones',
});
