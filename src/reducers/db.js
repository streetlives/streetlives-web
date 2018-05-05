import {
  GET_LOCATION_RESPONSE,
  GET_TAXONOMY_RESPONSE,
  OPTIMISTIC_UPDATE_LOCATION,
  ROLLBACK_UPDATE_LOCATION,
  OPTIMISTIC_UPDATE_PHONE,
  OPTIMISTIC_CREATE_PHONE,
  CREATE_PHONE_SUCCESS,
} from '../actions';

export const dbReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_LOCATION_RESPONSE:
      if (action.payload) {
        return { ...state, [action.payload.id]: action.payload };
      }
      break;
    case GET_TAXONOMY_RESPONSE:
      return action.payload ? { ...state, taxonomy: [...action.payload] } : state;
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
    case OPTIMISTIC_UPDATE_PHONE: {
      const location = state[action.payload.locationId];
      const idx = location.Phones.findIndex(phone => phone.id === action.payload.phoneId);
      const phone = location.Phones[idx];
      const newPhones = [
        ...location.Phones.slice(0, idx),
        { ...phone, ...action.payload.params },
        ...location.Phones.slice(idx + 1),
      ];
      return constructNewStateWithUpdatedPhones(state, action, newPhones);
    }
    case OPTIMISTIC_CREATE_PHONE: {
      const location = state[action.payload.locationId];
      let newPhones;
      if (!location.Phones) {
        newPhones = [action.payload.params];
      } else {
        newPhones = location.Phones.concat(action.payload.params);
      }
      return constructNewStateWithUpdatedPhones(state, action, newPhones);
    }
    case CREATE_PHONE_SUCCESS: {
      const location = state[action.payload.locationId];
      const idx = location.Phones.findIndex(phone =>
        !phone.id &&
          phone.number === action.payload.params.number &&
          phone.extension === action.payload.params.extension);
      const phone = location.Phones[idx];
      const newPhones = [
        ...location.Phones.slice(0, idx),
        { ...phone, ...action.payload.params },
        ...location.Phones.slice(idx + 1),
      ];
      return constructNewStateWithUpdatedPhones(state, action, newPhones);
    }
    default:
      return state;
  }

  return state;
};

function constructNewStateWithUpdatedPhones(state, action, newPhones) {
  return {
    ...state,
    [`last/${action.payload.locationId}`]: state[action.payload.locationId],
    [action.payload.locationId]: {
      ...state[action.payload.locationId],
      Phones: newPhones,
    },
  };
}

export const selectLocationData = (state, locationId) => state.db[locationId];
