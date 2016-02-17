import * as AuthActionTypes from '../actions/auth'
import merge from 'lodash/merge'
import pick from 'lodash/pick'
import keys from 'lodash/keys'
import values from 'lodash/values'
import paginate from './paginate'
import { routeReducer } from 'react-router-redux'
import { combineReducers } from 'redux'

// Updates an entity cache in response to any action with response.entities.
const initialEntitiesState = {
  authTokens: {},
  users: {},
}
function entities(state = initialEntitiesState, action) {
  if (action.type === AuthActionTypes.LOGOUT_SUCCESS) {
    return initialEntitiesState
  }
  if (action.response && action.response.entities) {
    const merged = merge({}, state, action.response.entities)
    return pick(merged, keys(initialEntitiesState))
  }
  return state
}

// Updates the state to store the current auth token id
export const AUTH_LOADING = Symbol('authLoading')
function authTokenId(state = AUTH_LOADING, action) {
  if (action.type === AuthActionTypes.LOGOUT_SUCCESS) {
    return null
  }
  if (action.type === AuthActionTypes.AUTH_RESTORE_SUCCESS) {
    return action.authTokenId
  }
  if (action.response &&
      action.response.entities &&
      action.response.entities.authTokens) {
    return values(action.response.entities.authTokens)[0].id
  }
  return state
}

// Updates the state to store the current auth user id
function authUserId(state = AUTH_LOADING, action) {
  if (action.type === AuthActionTypes.LOGOUT_SUCCESS) {
    return null
  }
  if (action.type === AuthActionTypes.AUTH_RESTORE_SUCCESS) {
    return action.authUserId
  }
  if (action.response &&
      action.response.entities &&
      action.response.entities.authTokens) {
    return values(action.response.entities.authTokens)[0].userId
  }
  return state
}

// Updates the pagination data for different actions.
/*
const pagination = combineReducers({
  starredByUser: paginate({
    mapActionToKey: action => action.login,
    types: [
      ActionTypes.STARRED_REQUEST,
      ActionTypes.STARRED_SUCCESS,
      ActionTypes.STARRED_FAILURE
    ]
  }),
  stargazersByRepo: paginate({
    mapActionToKey: action => action.fullName,
    types: [
      ActionTypes.STARGAZERS_REQUEST,
      ActionTypes.STARGAZERS_SUCCESS,
      ActionTypes.STARGAZERS_FAILURE
    ]
  })
})
*/

const rootReducer = combineReducers({
  entities,
  authTokenId,
  authUserId,
  //pagination,
  routing: routeReducer
})


export default rootReducer
