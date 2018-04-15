import { getLocation as getLoc } from '../services/api';

export const getLocation = (locationId) => {
  return dispatch => {
    getLoc({
      id : locationId    
    })
    .then(locationData => dispatch({
      type : 'GET_LOCATION_RESPONSE',
      payload : locationData  
    }))
    .catch(e => console.error('error', e));
  }
}
