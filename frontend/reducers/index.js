import * as AuthActionTypes from '../actions/auth'
import * as ModelActionTypes from '../actions/model'
import * as FileActionTypes from '../actions/file'
import merge from 'lodash/merge'
import pick from 'lodash/pick'
import keys from 'lodash/keys'
import values from 'lodash/values'
import filter from 'lodash/filter'
import paginate from './paginate'
import { authTokenId, authUserId } from './auth'
import { createModel } from './model'
import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'

// Updates an entity cache in response to any action with response.entities.
const initialEntitiesState = {
  authTokens: {},
  users: {},
  models: {},
  files: {}
}
function entities(state = initialEntitiesState, action) {
  if (action.type === AuthActionTypes.LOGOUT_REQUEST) {
    return initialEntitiesState
  }

  // When we delete a model, we just clear our model cache, so we can then
  // repopulate it without that deleted model
  if (action.type === ModelActionTypes.DELETE_MODEL_SUCCESS) {
    const merged = merge({}, state)
    merged.models = {}
    merged.files = {}
    return merged
  }

  if (action.response && action.response.entities) {
    const merged = merge({}, state, action.response.entities)
    return pick(merged, keys(initialEntitiesState))
  }
  return state
}

function createFetchStateFunc(fetchName, errorName, actionTypes, actionTypePrefix) {
  return function(state = {[fetchName]: false, [errorName]: null}, action) {
    if (action.type === actionTypes[actionTypePrefix + '_REQUEST']) {
      return {[fetchName]: true, [errorName]: null}
    }
    if (action.type === actionTypes[actionTypePrefix + '_SUCCESS']) {
      return {[fetchName]: false, [errorName]: null}
    }
    if (action.type === actionTypes[actionTypePrefix + '_FAILURE']) {
      return {[fetchName]: false, [errorName]: action.error}
    }
    return state
  }
}

const login = createFetchStateFunc('loggingIn', 'loginError', AuthActionTypes, 'AUTH_LOGIN')
const register = createFetchStateFunc('registering', 'registerError', AuthActionTypes, 'AUTH_REGISTER')
const userByUsername = createFetchStateFunc('fetching', 'fetchError', AuthActionTypes, 'USER_BY_USERNAME')
const modelsByUsername = createFetchStateFunc('fetching', 'fetchError', ModelActionTypes, 'MODELS_BY_USERNAME')
const modelByUsernameAndSlug = createFetchStateFunc('fetching', 'fetchError', ModelActionTypes, 'MODEL_BY_USERNAME_AND_SLUG')
const filesByUsernameAndSlug = createFetchStateFunc('fetching', 'fetchError', FileActionTypes, 'FILES_BY_USERNAME_AND_SLUG')
const deleteModel = createFetchStateFunc('deleting', 'deleteError', ModelActionTypes, 'DELETE_MODEL')
const latestPublicModels = createFetchStateFunc('fetching', 'fetchError', ModelActionTypes, 'LATEST_PUBLIC_MODELS')
const topModels = createFetchStateFunc('fetching', 'fetchError', ModelActionTypes, 'TOP_MODELS')
const fileVersions = createFetchStateFunc('fetching', 'fetchError', FileActionTypes, 'FILE_VERSIONS')

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
  userByUsername,
  modelsByUsername,
  modelByUsernameAndSlug,
  filesByUsernameAndSlug,
  createModel,
  deleteModel,
  latestPublicModels,
  topModels,
  fileVersions,
  //pagination,
  routing: routerReducer
})


export default rootReducer
