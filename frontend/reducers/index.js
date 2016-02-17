import * as AuthActionTypes from '../actions/auth'
import merge from 'lodash/merge'
import pick from 'lodash/pick'
import keys from 'lodash/keys'
import values from 'lodash/values'
import paginate from './paginate'
import { authTokenId, authUserId, login, register } from './auth'
import { routeReducer } from 'react-router-redux'
import { combineReducers } from 'redux'

// Updates an entity cache in response to any action with response.entities.
const initialEntitiesState = {
  authTokens: {},
  users: {},
}
function entities(state = initialEntitiesState, action) {
  if (action.type === AuthActionTypes.LOGOUT_REQUEST) {
    return initialEntitiesState
  }
  if (action.response && action.response.entities) {
    const merged = merge({}, state, action.response.entities)
    return pick(merged, keys(initialEntitiesState))
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
  login,
  register,
  //pagination,
  routing: routeReducer
})


export default rootReducer
