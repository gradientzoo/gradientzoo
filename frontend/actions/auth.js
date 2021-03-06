import { CALL_API, Schemas } from '../middleware/api'

export const AUTH_RESTORE_REQUEST = 'AUTH_RESTORE_REQUEST'
export const AUTH_RESTORE_SUCCESS = 'AUTH_RESTORE_SUCCESS'
export const AUTH_RESTORE_FAILURE = 'AUTH_RESTORE_FAILURE'

export function restore() {
  return {type: AUTH_RESTORE_REQUEST}
}

export const AUTH_USER_REQUEST = 'AUTH_USER_REQUEST'
export const AUTH_USER_SUCCESS = 'AUTH_USER_SUCCESS'
export const AUTH_USER_FAILURE = 'AUTH_USER_FAILURE'

export function loadAuthUser() {
  return {
    [CALL_API]: {
      types: [ AUTH_USER_REQUEST, AUTH_USER_SUCCESS, AUTH_USER_FAILURE ],
      endpoint: `auth/user`,
      schema: Schemas.AUTH_USER
    }
  }
}

export const USER_BY_USERNAME_REQUEST = 'USER_BY_USERNAME_REQUEST'
export const USER_BY_USERNAME_SUCCESS = 'USER_BY_USERNAME_SUCCESS'
export const USER_BY_USERNAME_FAILURE = 'USER_BY_USERNAME_FAILURE'

export function loadUserByUsername(username) {
  return {
    [CALL_API]: {
      types: [ USER_BY_USERNAME_REQUEST, USER_BY_USERNAME_SUCCESS, USER_BY_USERNAME_FAILURE ],
      endpoint: `user/username/${username}`,
      schema: Schemas.USER_RESPONSE
    }
  }
}

export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST'
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS'
export const AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE'

export function login(emailOrUsername, password) {
  return {
    [CALL_API]: {
      types: [ AUTH_LOGIN_REQUEST, AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILURE ],
      endpoint: `auth/login`,
      payload: {emailOrUsername, password},
      schema: Schemas.AUTH_RESPONSE
    }
  }
}

export const AUTH_REGISTER_REQUEST = 'AUTH_REGISTER_REQUEST'
export const AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS'
export const AUTH_REGISTER_FAILURE = 'AUTH_REGISTER_FAILURE'

export function register(email, username, password) {
  return {
    [CALL_API]: {
      types: [ AUTH_REGISTER_REQUEST, AUTH_REGISTER_SUCCESS, AUTH_REGISTER_FAILURE ],
      endpoint: `auth/register`,
      payload: {email, username, password},
      schema: Schemas.AUTH_RESPONSE
    }
  }
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

export function logout(email, password) {
  return {
    [CALL_API]: {
      types: [ LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE ],
      endpoint: `auth/logout`,
      payload: {},
      schema: Schemas.STATUS
    }
  }
}

export const UPDATE_STRIPE_REQUEST = 'UPDATE_STRIPE_REQUEST'
export const UPDATE_STRIPE_SUCCESS = 'UPDATE_STRIPE_SUCCESS'
export const UPDATE_STRIPE_FAILURE = 'UPDATE_STRIPE_FAILURE'

export function updateStripe(stripe_token) {
  return {
    [CALL_API]: {
      types: [ UPDATE_STRIPE_REQUEST, UPDATE_STRIPE_SUCCESS, UPDATE_STRIPE_FAILURE ],
      endpoint: `auth/stripe`,
      payload: {stripe_token},
      schema: Schemas.USER_RESPONSE
    }
  }
}