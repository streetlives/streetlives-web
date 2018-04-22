import { GET_LOCATION_RESPONSE, OPTIMISTIC_UPDATE_LOCATION, ROLLBACK_UPDATE_LOCATION } from '../actions';

const dbReducer = (state = {}, action) => {
  switch(action.type){
    case GET_LOCATION_RESPONSE:
      if(action.payload){
        return {...state, [action.payload.id] : action.payload}
      }
      break;
    case OPTIMISTIC_UPDATE_LOCATION:
      if(action.payload){
        return {
          ...state,
          [`last/${action.payload.id}`] : state[action.payload.id],
          [action.payload.id] : { 
            ...state[action.payload.id],
            ...action.payload.params,
          }
        }
      }
      break;
    case ROLLBACK_UPDATE_LOCATION:
      if(action.payload){
        return {
          ...state,
          [`last/${action.payload.id}`] : null,
          [action.payload.id] : state[`last/${action.payload.id}`]
        }
      }
      break;
    default:
      return state;
  }

  return state;
}

export default dbReducer;
