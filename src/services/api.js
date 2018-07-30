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
  requestWithAuth(idJwtToken => axios.request({
    url: `${config.baseApi}/languages`,
    method: 'get',
    headers: {
      Authorization: idJwtToken,
    },
  }));

export const createServices = (locationId, locationTaxonomies) =>
  requestWithAuth((idJwtToken) => {
    const requests = locationTaxonomies.map(({ taxonomyId, name }) =>
      axios.request({
        url: `${config.baseApi}/services`,
        method: 'post',
        data: { locationId, taxonomyId, name },
        headers: {
          Authorization: idJwtToken,
        },
      }));

    return axios.all(requests);
  });

export const createOrganization = name =>
  requestWithAuth(idJwtToken => axios.request({
    url: `${config.baseApi}/organizations`,
    method: 'post',
    data: { name },
    headers: {
      Authorization: idJwtToken,
    },
  }))
    .then(result => result.data);

export const createLocation = ({ organizationId, position, address }) =>
  requestWithAuth(idJwtToken => axios.request({
    url: `${config.baseApi}/locations`,
    method: 'post',
    data: {
      organizationId,
      address,
      latitude: position.latitude,
      longitude: position.longitude,
    },
    headers: {
      Authorization: idJwtToken,
    },
  }))
    .then(result => result.data);

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

// TODO: Actually update the API to support this, and with this URL structure.
export const postComment = ({ locationId, comment }) =>
  requestWithAuth(idJwtToken => axios.request({
    url: `${config.baseApi}/comments`,
    method: 'post',
    data: {
      locationId,
      content: comment.content,
      postedBy: comment.name,
      contentInfo: comment.contactInfo,
    },
    headers: {
      Authorization: idJwtToken,
    },
  }))
    .then(result => result.data);
