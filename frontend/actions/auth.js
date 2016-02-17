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

export const ATTEMPT_AUTH_REQUEST = 'ATTEMPT_AUTH_REQUEST'
export const ATTEMPT_AUTH_SUCCESS = 'ATTEMPT_AUTH_SUCCESS'
export const ATTEMPT_AUTH_FAILURE = 'ATTEMPT_AUTH_FAILURE'

export function attemptAuth(email, password) {
  return {
    [CALL_API]: {
      types: [ ATTEMPT_AUTH_REQUEST, ATTEMPT_AUTH_SUCCESS, ATTEMPT_AUTH_FAILURE ],
      endpoint: `auth`,
      payload: {email, password},
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