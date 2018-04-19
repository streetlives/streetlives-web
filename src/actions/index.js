import { getLocation as getLoc, updateLocation as updateLoc } from '../services/api';

export const getLocation = locationId => (dispatch) => {
  getLoc({
    id: locationId,
  })
    .then(locationData =>
      dispatch({
        type: 'GET_LOCATION_RESPONSE',
        payload: locationData,
      }))
    .catch(e => console.error('error', e)); // eslint-disable-line no-console
};

export const updateLocation = (locationId, params) => (dispatch) => {
  // optimistically update the data store
  dispatch({
    type: 'OPTIMISTIC_UPDATE_LOCATION',
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
      console.error('error', e); // eslint-disable-line no-console
      dispatch({
        type: 'ROLLBACK_UPDATE_LOCATION',
        payload: {
          id: locationId,
        },
      });
    });
};
