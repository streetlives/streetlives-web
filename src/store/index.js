import { createStore, applyMiddleware } from 'redux'
import {combineReducers, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer  from '../reducers';
import _ from 'underscore';
import createHistory from 'history/createBrowserHistory'
import { routerReducer, routerMiddleware } from 'react-router-redux'

let composedEnhancers;
export const history = createHistory()
const enhancers = []
const middleware = [
  thunk,
  routerMiddleware(history)
]

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window['__REDUX_DEVTOOLS_EXTENSION__']

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}

composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
)

export const store = createStore(combineReducers(_.extend({},rootReducer,{router : routerReducer})), composedEnhancers);
