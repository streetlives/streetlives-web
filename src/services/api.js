import axios from 'axios';
import Amplify from 'aws-amplify';
import config from '../config';

export const getLocations = ({
  latitude,
  longitude,
  radius,
  searchString,
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
    })
      .then(result => result.data);
  });

export const updateLocation = ({ id, params }) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();

    const {
      name,
    } = params;

    return axios.request({
      url: `${config.baseApi}/locations/${id}`,
      method: 'patch',
      data: { name },
      headers: {
        Authorization: idJwtToken,
      },
    });
  });
