import axios from 'axios';
import qs from 'qs';
import config from '../config';
import { TAXONOMY_SPECIFIC_ATTRIBUTES } from '../Constants';
import { getAuthToken } from './auth';

export const getLocations = ({
  latitude,
  longitude,
  radius,
  minResults,
  searchString,
  occasion,
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
    radius,
  };

  if (occasion) {
    params.occasion = occasion;
  }
  if (searchString) {
    params.searchString = searchString;
  }
  if (taxonomyIds) {
    params.taxonomyId = taxonomyIds.join(',');
  }
  if (minResults) {
    params.minResults = minResults;
  }
  if (openNow) {
    params.openAt = (new Date()).toISOString();
  }
  if (referralRequired != null) {
    params.referralRequired = referralRequired;
  }
  if (photoId != null) {
    params.photoIdRequired = photoId;
  }
  if (clientsOnly != null) {
    params.membership = clientsOnly;
  }
  if (gender != null) {
    params.gender = gender;
  }
  if (zipcode != null) {
    params.servesZipcode = zipcode;
  }

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

export const getOrganizations = searchString =>
  getAuthToken()
    .then(idJwtToken =>
      axios
        .request({
          url: `${config.baseApi}/organizations?searchString=${searchString}`,
          method: 'get',
          headers: {
            Authorization: idJwtToken,
          },
        }))
    .then(result => result.data);

export const getOrganizationLocations = organizationId =>
  getAuthToken()
    .then(idJwtToken =>
      axios
        .request({
          url: `${config.baseApi}/organizations/${organizationId}/locations`,
          method: 'get',
          headers: {
            Authorization: idJwtToken,
          },
        }))
    .then(result => result.data);

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

/* ------ Error Report API functions -------- */
export const getErrorReports = ({ locationId }) =>
  axios
    .request({
      url: `${config.baseApi}/errorreports`,
      method: 'get',
      params: {
        locationId,
      },
    })
    .then(result => result.data);

export const postErrorReport = ({ locationId, errorReport }) =>
  getAuthToken() // Remove authorization requirement for posting new error reports?
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/errorreports`,
      method: 'post',
      data: {
        locationId,
        generalLocationError: errorReport.generalLocationError,
        services: errorReport.services,
        content: errorReport.content,
      },
      headers: {
        Authorization: idJwtToken,
      },
    }))
    .then(result => result.data);

export const deleteErrorReport = errorReport =>
  getAuthToken()
    .then(idJwtToken => axios.request({
      url: `${config.baseApi}/errorreports/${errorReport.id}`,
      method: 'delete',
      headers: {
        Authorization: idJwtToken,
      },
    }));
