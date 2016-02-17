import * as AuthActionTypes from '../actions/auth'
import localforage from 'localforage'
import values from 'lodash/values'

const STORAGE_NAME = 'gradientzoo'
const STORAGE_AUTH_TOKEN_KEY = 'authTokenId'
const STORAGE_AUTH_USER_KEY = 'authUserId'

const localStore = localforage.createInstance({name: STORAGE_NAME})

export const load = store => next => action => {
  if (!action.type) {
    return next(action)
  }

  if (action.type !== AuthActionTypes.AUTH_RESTORE_REQUEST) {
    return next(action)
  }

  const handleError = (err) => {
    next({
      type: AuthActionTypes.AUTH_RESTORE_FAILURE,
      error: err
    })
  }

  localStore.getItem(STORAGE_AUTH_TOKEN_KEY, (err, authTokenId) => {
    if (err) {
      handleError(err)
      return
    }
    localStore.getItem(STORAGE_AUTH_USER_KEY, (err, authUserId) => {
      if (err) {
        handleError(err)
        return
      }
      next({
        type: AuthActionTypes.AUTH_RESTORE_SUCCESS,
        authTokenId,
        authUserId
      })
    })
  })

  return next(action)
}

export const save = store => next => action => {
  if (action.type === AuthActionTypes.ATTEMPT_AUTH_SUCCESS) {
    localStore.setItem(STORAGE_AUTH_TOKEN_KEY, values(action.response.entities.authTokens)[0].id)
    localStore.setItem(STORAGE_AUTH_USER_KEY, values(action.response.entities.authTokens)[0].userId)
  }
  if (action.type === AuthActionTypes.LOGOUT_SUCCESS) {
    localStore.clear()
  }
  return next(action)
}

export default {load, save}