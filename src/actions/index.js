import { getLocation as getLoc, updateLocation as updateLoc } from '../services/api';

export const GET_LOCATION_RESPONSE = 'GET_LOCATION_RESPONSE';
export const OPTIMISTIC_UPDATE_LOCATION = 'OPTIMISTIC_UPDATE_LOCATION';
export const ROLLBACK_UPDATE_LOCATION = 'ROLLBACK_UPDATE_LOCATION';

export const getLocation = locationId => (dispatch) => {
  getLoc({
    id: locationId,
  })
    .then(locationData => dispatch({
      type: GET_LOCATION_RESPONSE,
      payload: locationData,
    }))
    .catch(e => console.error('error', e));
};

export const updateLocation = (locationId, params) => (dispatch) => {
  //optimistically update the data store
  dispatch({
    type: OPTIMISTIC_UPDATE_LOCATION,
    payload: {
      id : locationId, 
      params
    }
  });
  updateLoc({
    id: locationId,
    params,
  })
    .then(locationData => {
      //do nothing, because save succeeded
    })
    .catch(e => {
      //roll back
      console.error('error', e);
      dispatch({
        type: ROLLBACK_UPDATE_LOCATION,
        payload: {
          id : locationId
        }
      })
    });
};
