import axios from 'axios';
import Amplify from 'aws-amplify';
import config from '../config';

const requestWithAuth = (cb) => {
  if (config.disableAuth) {
    return cb(null);
  }
  return Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();
    return cb(idJwtToken);
  });
};

export const getLocations = ({
  latitude, longitude, radius, searchString,
}) =>
  requestWithAuth(idJwtToken =>
    axios
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
      .then(result => result.data));

export const getLocation = ({ id }) =>
  requestWithAuth(idJwtToken =>
    axios
      .request({
        url: `${config.baseApi}/locations/${id}`,
        method: 'get',
        headers: {
          Authorization: idJwtToken,
        },
      })
      .then(result => result.data));

const updateResource = ({ pathPrefix, method, pathSuffix }, { id, params }) =>
  requestWithAuth((idJwtToken) => {
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
  requestWithAuth(idJwtToken =>
    axios.request({
      url: `${config.baseApi}/taxonomy`,
      method: 'get',
      headers: {
        Authorization: idJwtToken,
      },
    }));

export const getLanguages = () =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const jwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios.request({
      url: `${config.baseApi}/languages`,
      method: 'get',
      headers: {
        Authorization: jwtToken,
      },
    });
  });

export const createService = (locationId, taxonomy, name) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const jwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios.request({
      url: `${config.baseApi}/services`,
      method: 'post',
      data: { locationId, taxonomyId: taxonomy.id, name },
      headers: {
        Authorization: jwtToken,
      },
    });
  });

export const createServices = (locationId, locationTaxonomies) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const jwtToken = user.signInUserSession.getIdToken().getJwtToken();

    const requests = locationTaxonomies.map(taxonomy =>
      axios.request({
        url: `${config.baseApi}/services`,
        method: 'post',
        data: { locationId, taxonomyId: taxonomy.id, name: taxonomy.name },
        headers: {
          Authorization: jwtToken,
        },
      }));

    return axios.all(requests);
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
export const updateOrganization = updateResource.bind(this, {
  pathPrefix: 'organizations',
  method: 'patch',
});
export const updateService = updateResource.bind(this, {
  pathPrefix: 'services',
  method: 'patch',
});

export const getOrganizations = searchString =>
  requestWithAuth(idJwtToken =>
    axios
      .request({
        url: `${config.baseApi}/organizations?searchString=${searchString}`,
        method: 'get',
        headers: {
          Authorization: idJwtToken,
        },
      })
      .then(result => result.data));

export const getOrganizationLocations = organizationId =>
  requestWithAuth(idJwtToken =>
    axios
      .request({
        url: `${config.baseApi}/organizations/${organizationId}/locations`,
        method: 'get',
        headers: {
          Authorization: idJwtToken,
        },
      })
      .then(result => result.data));
