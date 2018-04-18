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
  updateLoc({
    id: locationId,
    params,
  }).catch(e => console.error('error', e)); // eslint-disable-line no-console
};
