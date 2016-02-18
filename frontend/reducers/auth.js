import * as AuthActionTypes from '../actions/auth'
import values from 'lodash/values'
import merge from 'lodash/merge'

// Updates the state to store the current auth token id
export const AUTH_LOADING = Symbol('authLoading')
export function authTokenId(state = AUTH_LOADING, action) {
  if (action.type === AuthActionTypes.LOGOUT_REQUEST) {
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
export function authUserId(state = AUTH_LOADING, action) {
  if (action.type === AuthActionTypes.LOGOUT_REQUEST) {
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
