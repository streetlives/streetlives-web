import axios from 'axios';
import * as rax from 'retry-axios';
import qs from 'qs';
import config from '../config';
import { TAXONOMY_SPECIFIC_ATTRIBUTES } from '../Constants';
import { getAuthToken } from './auth';

const MAX_RADIUS = 50000;

export const getLocations = ({
  latitude,
  longitude,
  radius,
  minResults,
  searchString,
  organizationName,
  locationFieldsOnly,
  serviceFilters: {
    taxonomyIds,
    openNow,
    zipcode,
    referralRequired,
    photoId,
    clientsOnly,
    gender,
    clothingKind,
    wearerAge,
    tgncClothing,
    hivNutrition,
  } = {},
}) => {
  const params = {
    latitude,
    longitude,
    minResults,
    searchString,
    organizationName,
    locationFieldsOnly,
    radius: radius != null ? Math.min(radius, MAX_RADIUS) : undefined,
    taxonomyId: taxonomyIds != null ? taxonomyIds.join(',') : undefined,
    openAt: openNow ? (new Date()).toISOString() : undefined,
    referralRequired: referralRequired != null ? referralRequired : undefined,
    photoIdRequired: photoId != null ? photoId : undefined,
    membership: clientsOnly != null ? clientsOnly : undefined,
    gender: gender != null ? gender : undefined,
    servesZipcode: zipcode != null ? zipcode : undefined,
  };

  const attributes = [];
  if (clothingKind) {
    attributes.push(TAXONOMY_SPECIFIC_ATTRIBUTES.clothingOccasion);
    attributes.push(clothingKind);
  }
  if (wearerAge) {
    attributes.push(TAXONOMY_SPECIFIC_ATTRIBUTES.wearerAge);
    attributes.push(wearerAge);
  }
  if (tgncClothing) {
    attributes.push(TAXONOMY_SPECIFIC_ATTRIBUTES.tgncClothing);
    attributes.push(tgncClothing);
  }
  if (hivNutrition != null) {
    attributes.push(TAXONOMY_SPECIFIC_ATTRIBUTES.hasHivNutrition);
    attributes.push(hivNutrition);
  }
  if (attributes.length) {
    params.taxonomySpecificAttributes = attributes;
  }

  return axios
    .request({
      url: `${config.baseApi}/locations`,
      method: 'get',
      params,
      paramsSerializer: rawParams => qs.stringify(rawParams),
    })
    .then(result => result.data);
};

export const getLocation = ({ id }) =>
  axios
    .request({
      url: `${config.baseApi}/locations/${id}`,
      method: 'get',
    })
    .then(result => result.data);

const updateResource = ({ pathPrefix, method, pathSuffix }, { id, params }) =>
  getAuthToken()
    .then((idJwtToken) => {
      // construct the path
      const pathComponents = [config.baseApi, pathPrefix, id];
      if (pathSuffix) pathComponents.push(pathSuffix);
      const url = pathComponents.join('/');

      const axiosWithRetries = axios.create();
      axiosWithRetries.defaults.raxConfig = { instance: axiosWithRetries };
      rax.attach(axiosWithRetries);

      return axiosWithRetries.request({
        url,
        method,
        data: params,
        headers: {
          Authorization: idJwtToken,
        },
        raxConfig: {
          httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT', 'PATCH'],
          retry: 6,
          noResponseRetries: 6,
        },
      });
    });

export const getTaxonomy = () =>
  axios.request({
    url: `${config.baseApi}/taxonomy`,
    method: 'get',
  })
    .then(result => result.data);

export const getLanguages = () =>
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/languages`,
      method: 'get',
      headers: {
        Authorization: idJwtToken,
      },
    }));

export const createServices = (locationId, locationTaxonomies) =>
  getAuthToken()
    .then((idJwtToken) => {
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
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/organizations`,
      method: 'post',
      data: { name },
      headers: {
        Authorization: idJwtToken,
      },
    }))
    .then(result => result.data);

export const createLocation = ({ organizationId, position, address }) =>
  getAuthToken()
    .then(idJwtToken => axios.request({
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

export const getComments = ({ locationId }) =>
  axios
    .request({
      url: `${config.baseApi}/comments`,
      method: 'get',
      params: {
        locationId,
      },
    })
    .then(result => result.data);

export const postComment = ({ locationId, comment }) =>
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/comments`,
      method: 'post',
      data: {
        locationId,
        content: comment.content,
        postedBy: comment.name,
        contactInfo: comment.contactInfo,
      },
      headers: {
        Authorization: idJwtToken,
      },
    }))
    .then(result => result.data);

export const replyToComment = ({ originalCommentId, reply }) =>
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/comments/${originalCommentId}/reply`,
      method: 'post',
      data: {
        content: reply.content,
      },
      headers: {
        Authorization: idJwtToken,
      },
    }))
    .then(result => result.data);

export const deleteReply = reply =>
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/comments/${reply.id}`,
      method: 'delete',
      headers: {
        Authorization: idJwtToken,
      },
    }));

export const removeComment = comment =>
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/comments/${comment.id}/hidden`,
      method: 'put',
      data: {
        hidden: true,
      },
      headers: {
        Authorization: idJwtToken,
      },
    }));
