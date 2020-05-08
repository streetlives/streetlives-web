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
export const POST_REPLY_REQUEST = 'POST_REPLY_REQUEST';
export const POST_REPLY_SUCCESS = 'POST_REPLY_SUCCESS';
export const POST_REPLY_ERROR = 'POST_REPLY_ERROR';
export const DELETE_REPLY_REQUEST = 'DELETE_REPLY_REQUEST';
export const DELETE_REPLY_SUCCESS = 'DELETE_REPLY_SUCCESS';
export const DELETE_REPLY_ERROR = 'DELETE_REPLY_ERROR';
export const REMOVE_COMMENT_REQUEST = 'REMOVE_COMMENT_REQUEST';
export const REMOVE_COMMENT_SUCCESS = 'REMOVE_COMMENT_SUCCESS';
export const REMOVE_COMMENT_ERROR = 'REMOVE_COMMENT_ERROR';
export const POST_ERROR_REPORT_REQUEST = 'POST_ERROR_REPORT_REQUEST';
export const POST_ERROR_REPORT_SUCCESS = 'POST_ERROR_REPORT_SUCCESS';
export const POST_ERROR_REPORT_ERROR = 'POST_ERROR_REPORT_ERROR';

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
    .then(taxonomy =>
      dispatch({
        type: GET_TAXONOMY_RESPONSE,
        payload: taxonomy,
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

export const replyToComment = (locationId, originalCommentId, reply) => (dispatch) => {
  const params = { locationId, originalCommentId, reply };
  dispatch({ type: POST_REPLY_REQUEST, payload: params });
  api.replyToComment({ locationId, originalCommentId, reply })
    .then((postedReply) => {
      dispatch({
        type: POST_REPLY_SUCCESS,
        payload: {
          ...params,
          reply: postedReply,
        },
      });
    })
    .catch((err) => {
      dispatch({ type: POST_REPLY_ERROR, payload: { ...params, err } });
    });
};

export const deleteReply = ({ locationId, originalCommentId, reply }) => (dispatch) => {
  const params = { locationId, originalCommentId, reply };
  dispatch({ type: DELETE_REPLY_REQUEST, payload: params });
  api.deleteReply(reply)
    .then(() => {
      dispatch({ type: DELETE_REPLY_SUCCESS, payload: params });
    })
    .catch((err) => {
      dispatch({ type: DELETE_REPLY_ERROR, payload: { ...params, err } });
    });
};

export const removeComment = ({ locationId, comment }) => (dispatch) => {
  const params = { locationId, comment };
  dispatch({ type: REMOVE_COMMENT_REQUEST, payload: params });
  api.removeComment(comment)
    .then(() => {
      dispatch({ type: REMOVE_COMMENT_SUCCESS, payload: params });
    })
    .catch((err) => {
      dispatch({ type: REMOVE_COMMENT_ERROR, payload: { ...params, err } });
    });
};

export const postErrorReport = (locationId, errorReport) => (dispatch) => {
  const params = { locationId, errorReport };
  dispatch({ type: POST_ERROR_REPORT_REQUEST, payload: params });
  api.postErrorReport({ locationId, errorReport })
    .then((postedErrorReport) => {
      dispatch({
        type: POST_ERROR_REPORT_SUCCESS,
        payload: {
          locationId,
          errorReport: postedErrorReport,
        },
      });
    })
    .catch((err) => {
      dispatch({ type: POST_ERROR_REPORT_ERROR, payload: { ...params, err } });
    });
};
