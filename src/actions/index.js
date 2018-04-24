import {
  getLocation as getLoc,
  updateLocation as updateLoc,
  updatePhone as updatePh,
} from '../services/api';

export const GET_LOCATION_RESPONSE = 'GET_LOCATION_RESPONSE';
export const OPTIMISTIC_UPDATE_LOCATION = 'OPTIMISTIC_UPDATE_LOCATION';
export const ROLLBACK_UPDATE_LOCATION = 'ROLLBACK_UPDATE_LOCATION';
export const OPTIMISTIC_UPDATE_PHONE = 'OPTIMISTIC_UPDATE_PHONE';

export const getLocation = locationId => (dispatch) => {
  getLoc({
    id: locationId,
  })
    .then(locationData =>
      dispatch({
        type: GET_LOCATION_RESPONSE,
        payload: locationData,
      }))
    /* eslint-disable no-console */
    .catch(e => console.error('error', e));
};

export const updateLocation = (locationId, params) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: OPTIMISTIC_UPDATE_LOCATION,
    payload: {
      id: locationId,
      params,
    },
  });
  updateLoc({
    id: locationId,
    params,
  })
    .then((locationData) => {
      // do nothing, because save succeeded
    })
    .catch((e) => {
      // roll back
      /* eslint-disable no-console */
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id: locationId,
        },
      });
    });
};

export const updatePhone = (locationId, phoneId, params) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: OPTIMISTIC_UPDATE_PHONE,
    payload: {
      locationId,
      phoneId,
      params,
    },
  });
  updatePh({
    id: phoneId,
    params,
  })
    .then((phoneData) => {
      // do nothing, because save succeeded
    })
    .catch((e) => {
      // roll back
      /* eslint-disable no-console */
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id: locationId,
        },
      });
    });
};
