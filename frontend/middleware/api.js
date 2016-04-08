import { Schema, arrayOf, normalize } from 'normalizr'
import { camelizeKeys, decamelizeKeys } from 'humps'
import isString from 'lodash/isString'
import 'isomorphic-fetch'

/*
// Extracts the next page URL from Github API response.
function getNextPageUrl(response) {
  const link = response.headers.get('link')
  if (!link) {
    return null
  }

  const nextLink = link.split(',').find(s => s.indexOf('rel="next"') > -1)
  if (!nextLink) {
    return null
  }

  return nextLink.split(';')[0].slice(1, -1)
}
*/

//const API_ROOT = 'http://localhost:8000/'
//const API_ROOT = 'https://api.gradientzoo.com/'
const API_ROOT = '/api/'

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
function callApi(endpoint, schema, payload, authTokenId) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  if (isString(authTokenId)) {
    headers['X-Auth-Token-Id'] = authTokenId
  }

  const fetched = payload ?
    fetch(fullUrl, {
      method: 'post',
      body: JSON.stringify(decamelizeKeys(payload)),
      headers: headers}) :
    fetch(fullUrl, {headers: headers})

  return fetched.then(response =>
      response.json().then(json => ({ json, response }))
    ).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json)
      }

      const camelizedJson = camelizeKeys(json)
      //const nextPageUrl = getNextPageUrl(response)

      return Object.assign({},
        normalize(camelizedJson, schema)/*,
        { nextPageUrl }*/
      )
    })
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const userSchema = new Schema('users')
const authUserSchema = new Schema('authUser')
const authTokenSchema = new Schema('authTokens')
const authResponseSchema = new Schema('authResponse')
const userResponseSchema = new Schema('userResponse')
const statusSchema = new Schema('status')
const modelSchema = new Schema('models')
const modelResponseSchema = new Schema('modelResponse')
const modelsResponseSchema = new Schema('modelsResponse')
const fileSchema = new Schema('files')
const fileResponseSchema = new Schema('fileResponse')
const filesResponseSchema = new Schema('filesResponse')

// Nesting definitions
authUserSchema.define({authUser: userSchema})
authResponseSchema.define({
  authUser: userSchema,
  authToken: authTokenSchema
})
userResponseSchema.define({user: userSchema})
modelResponseSchema.define({model: modelSchema})
modelsResponseSchema.define({models: arrayOf(modelSchema)})
fileResponseSchema.define({file: fileSchema})
filesResponseSchema.define({files: arrayOf(fileSchema)})

// Schemas for Github API responses.
export const Schemas = {
  AUTH_USER: authUserSchema,
  AUTH_RESPONSE: authResponseSchema,
  USER_RESPONSE: userResponseSchema,
  STATUS: statusSchema,
  MODEL_RESPONSE: modelResponseSchema,
  MODELS_RESPONSE: modelsResponseSchema,
  FILE_RESPONSE: fileResponseSchema,
  FILES_RESPONSE: filesResponseSchema
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call API')

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = callAPI
  const { schema, types } = callAPI
  const payload = callAPI.payload || null

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!schema) {
    throw new Error('Specify one of the exported Schemas.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))

  const authTokenId = store.getState().authTokenId

  return callApi(endpoint, schema, payload, authTokenId).then(
    response => next(actionWith({
      response,
      type: successType
    })),
    error => next(actionWith({
      type: failureType,
      error: error.error || 'Error communicating with server'
    }))
  )
}
