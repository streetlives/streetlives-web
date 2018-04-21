import _ from 'underscore';

const dbReducer = (state = {}, action) => {
  switch(action.type){
    case 'GET_LOCATION_RESPONSE':
      if(action.payload){
        return _.extend({ [action.payload.id] : action.payload}, state)
      }
      break;
    case 'OPTIMISTIC_UPDATE_LOCATION':
      if(action.payload){
        return _.extend(
          {},
          state,
          {
            [`last/${action.payload.id}`] : state[action.payload.id],
            [action.payload.id] : _.extend({}, state[action.payload.id], action.payload.params)
          }
        )
      }
      break;
    case 'ROLLBACK_UPDATE_LOCATION':
      if(action.payload){
        return _.extend(
          {},
          state,
          {
            [`last/${action.payload.id}`] : null,
            [action.payload.id] : state[`last/${action.payload.id}`]
          }
        )
      }
      break;
    default:
      return state;
  }

  return state;
}

export const selectLocationData = (state, locationId) => state.db[locationId];

export const rootReducerObj = {
  db : dbReducer
};

export default rootReducerObj;
