/* eslint-disable no-console */
import * as api from '../services/api';

export const GET_LOCATION_REQUEST = 'GET_LOCATION_REQUEST';
export const GET_LOCATION_RESPONSE = 'GET_LOCATION_RESPONSE';
export const GET_LOCATION_ERROR = 'GET_LOCATION_ERROR';
export const GET_COMMENTS_RESPONSE = 'GET_COMMENTS_RESPONSE';
export const GET_TAXONOMY_RESPONSE = 'GET_TAXONOMY_RESPONSE';
export const OPTIMISTIC_UPDATE_LOCATION = 'OPTIMISTIC_UPDATE_LOCATION';
export const OPTIMISTIC_UPDATE_SERVICE = 'OPTIMISTIC_UPDATE_SERVICE';
export const OPTIMISTIC_POST_COMMENT = 'OPTIMISTIC_POST_COMMENT';
export const ROLLBACK_UPDATE_LOCATION = 'ROLLBACK_UPDATE_LOCATION';
export const ROLLBACK_UPDATE_SERVICE = 'ROLLBACK_UPDATE_SERVICE';
export const ROLLBACK_POST_COMMENT = 'ROLLBACK_POST_COMMENT';
export const POST_COMMENT_SUCCESS = 'POST_COMMENT_SUCCESS';
export const OPTIMISTIC_UPDATE_ORGANIZATION = 'OPTIMISTIC_UPDATE_ORGANIZATION';
export const OPTIMISTIC_UPDATE_PHONE = 'OPTIMISTIC_UPDATE_PHONE';
export const OPTIMISTIC_CREATE_PHONE = 'OPTIMISTIC_CREATE_PHONE';
export const CREATE_PHONE_SUCCESS = 'CREATE_PHONE_SUCCESS';
export const START_CREATING_NEW_LOCATION = 'START_CREATING_NEW_LOCATION';
export const DONE_CREATING_NEW_LOCATION = 'DONE_CREATING_NEW_LOCATION';

export const getLocation = locationId => (dispatch) => {
  dispatch({
    type: GET_LOCATION_REQUEST,
    locationId,
  });
  api
    .getLocation({
      id: locationId,
    })
    .then(data =>
      dispatch({
        type: GET_LOCATION_RESPONSE,
        payload: data,
      }))
    .catch(e => dispatch({
      type: GET_LOCATION_ERROR,
      locationId,
      errorMessage: e.message,
    }));
};

export const getTaxonomy = () => (dispatch) => {
  api
    .getTaxonomy()
    .then(({ data }) =>
      dispatch({
        type: GET_TAXONOMY_RESPONSE,
        payload: data,
      }))
    .catch(e => console.error('error', e));
};

export const getComments = locationId => (dispatch) => {
  api
    .getComments({
      locationId,
    })
    .then(data =>
      dispatch({
        type: GET_COMMENTS_RESPONSE,
        payload: {
          locationId,
          comments: data,
        },
      }))
    .catch(e => console.error('error', e));
};

export const startCreatingNewLocation = (position, address) => ({
  type: START_CREATING_NEW_LOCATION,
  payload: { position, address },
});

export const doneCreatingNewLocation = newLocation => ({
  type: DONE_CREATING_NEW_LOCATION,
  payload: {
    wasCreatedSuccessfully: !!newLocation,
    newLocation,
  },
});

export const updateLocation = (locationId, params, metaDataSection, fieldName) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: OPTIMISTIC_UPDATE_LOCATION,
    payload: {
      id: locationId,
      params,
      metaDataSection,
      fieldName,
    },
  });
  api
    .updateLocation({
      id: locationId,
      params,
    })
    .then((locationData) => {
      // do nothing, because save succeeded
    })
    .catch((e) => {
      // roll back
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id: locationId,
        },
      });
    });
};

export const updatePhone = (
  locationId,
  phoneId,
  params,
  metaDataSection,
  fieldName,
) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: OPTIMISTIC_UPDATE_PHONE,
    payload: {
      locationId,
      phoneId,
      params,
      metaDataSection,
      fieldName,
    },
  });
  api
    .updatePhone({
      id: phoneId,
      params,
    })
    .then((phoneData) => {
      // do nothing, because save succeeded
    })
    .catch((e) => {
      // roll back
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id: locationId,
        },
      });
    });
};

export const createPhone = (
  locationId,
  phoneId,
  params,
  metaDataSection,
  fieldName,
) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: OPTIMISTIC_CREATE_PHONE,
    payload: {
      locationId,
      params,
      metaDataSection,
      fieldName,
    },
  });
  api
    .createPhone({
      id: locationId,
      params,
    })
    .then((response) => {
      dispatch({
        type: CREATE_PHONE_SUCCESS,
        payload: {
          locationId,
          params: response.data,
        },
      });
    })
    .catch((e) => {
      // roll back
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id: locationId,
        },
      });
    });
};

export const updateOrganization = (
  locationId,
  organizationId,
  params,
  metaDataSection,
  fieldName,
) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: OPTIMISTIC_UPDATE_ORGANIZATION,
    payload: {
      locationId,
      organizationId,
      params,
      metaDataSection,
      fieldName,
    },
  });
  api
    .updateOrganization({
      id: organizationId,
      params,
    })
    .then((locationData) => {
      // do nothing, because save succeeded
    })
    .catch((e) => {
      // roll back
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id: locationId,
        },
      });
    });
};

export const updateService = ({
  locationId,
  serviceId,
  params,
  metaDataSection,
  fieldName,
}) => (dispatch) => {
  dispatch({
    type: OPTIMISTIC_UPDATE_SERVICE,
    payload: {
      locationId,
      serviceId,
      params,
      metaDataSection,
      fieldName,
    },
  });
  api.updateService({ id: serviceId, params }).catch((e) => {
    console.error('error', e);
    dispatch({
      type: ROLLBACK_UPDATE_SERVICE,
      payload: { id: locationId },
    });
  });
};

export const updateLanguages = ({
  locationId,
  serviceId,
  languages,
  metaDataSection,
  fieldName,
}) => (dispatch) => {
  const languageIds = languages.map(el => el.id);
  dispatch({
    type: OPTIMISTIC_UPDATE_SERVICE,
    payload: {
      locationId,
      serviceId,
      params: { languages },
      metaDataSection,
      fieldName,
    },
  });

  api.updateService({ id: serviceId, params: { languageIds } }).catch((e) => {
    console.error('error', e);
    dispatch({
      type: ROLLBACK_UPDATE_SERVICE,
      payload: { id: locationId },
    });
  });
};

export const postComment = (locationId, comment) => (dispatch) => {
  dispatch({ type: OPTIMISTIC_POST_COMMENT, payload: { locationId, comment } });
  api.postComment({ locationId, comment })
    .then(() => {
      dispatch({ type: POST_COMMENT_SUCCESS, payload: { locationId, comment } });
    })
    .catch((e) => {
      dispatch({ type: ROLLBACK_POST_COMMENT, payload: { err: e, locationId, comment } });
    });
};
