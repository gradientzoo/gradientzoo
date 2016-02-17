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

export function login(state = {loggingIn: false, loginError: null}, action) {
  if (action.type === AuthActionTypes.AUTH_LOGIN_REQUEST) {
    return {loggingIn: true, loginError: null}
  }
  if (action.type === AuthActionTypes.AUTH_LOGIN_SUCCESS) {
    return {loggingIn: false, loginError: null}
  }
  if (action.type === AuthActionTypes.AUTH_LOGIN_FAILURE) {
    return {loggingIn: false, loginError: action.error}
  }
  return state
}

export function register(state = {registering: false, registerError: null}, action) {
  if (action.type === AuthActionTypes.AUTH_REGISTER_REQUEST) {
    return {registering: true, registerError: null}
  }
  if (action.type === AuthActionTypes.AUTH_REGISTER_SUCCESS) {
    return {registering: false, registerError: null}
  }
  if (action.type === AuthActionTypes.AUTH_REGISTER_FAILURE) {
    return {registering: false, registerError: action.error}
  }
  return state
}