import {
  GET_LOCATION_RESPONSE,
  OPTIMISTIC_UPDATE_LOCATION,
  ROLLBACK_UPDATE_LOCATION,
  OPTIMISTIC_UPDATE_PHONE
} from '../actions';

export const dbReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_LOCATION_RESPONSE:
      if (action.payload) {
        return { ...state, [action.payload.id]: action.payload };
      }
      break;
    case OPTIMISTIC_UPDATE_LOCATION:
      if (action.payload) {
        return {
          ...state,
          [`last/${action.payload.id}`]: state[action.payload.id],
          [action.payload.id]: {
            ...state[action.payload.id],
            ...action.payload.params,
          },
        };
      }
      break;
    case ROLLBACK_UPDATE_LOCATION:
      if (action.payload) {
        return {
          ...state,
          [`last/${action.payload.id}`]: null,
          [action.payload.id]: state[`last/${action.payload.id}`],
        };
      }
      break;
    case OPTIMISTIC_UPDATE_PHONE:
      const location = state[action.payload.locationId];
      const idx = location.Phones.map( phone => phone.id).indexOf(action.payload.phoneId)
      const phone = location.Phones[idx]
      const newPhones = location.Phones.slice(0,idx).concat({...phone, ...action.payload.params}).concat(location.Phones.slice(idx+1))
      console.log('newPhones',newPhones);
      if (action.payload) {
        return {
          ...state,
          [`last/${action.payload.locationId}`]: state[action.payload.locationId],
          [action.payload.locationId]: {
            ...state[action.payload.locationId],
            ...action.payload.params,
            'Phones' :  newPhones
          },
        };
      }
      break;
    default:
      return state;
  }

  return state;
};

export const selectLocationData = (state, locationId) => state.db[locationId];
