import { CALL_API, Schemas } from '../middleware/api'

export const CREATE_REQUEST = 'CREATE_REQUEST'
export const CREATE_SUCCESS = 'CREATE_SUCCESS'
export const CREATE_FAILURE = 'CREATE_FAILURE'

export function createModel(slug, name, description, visibility) {
  return {
    [CALL_API]: {
      types: [ CREATE_REQUEST, CREATE_SUCCESS, CREATE_FAILURE ],
      endpoint: `model/create`,
      payload: {slug, name, description, visibility},
      schema: Schemas.MODEL_RESPONSE
    }
  }
}

export const MODELS_BY_USERNAME_REQUEST = 'MODELS_BY_USERNAME_REQUEST'
export const MODELS_BY_USERNAME_SUCCESS = 'MODELS_BY_USERNAME_SUCCESS'
export const MODELS_BY_USERNAME_FAILURE = 'MODELS_BY_USERNAME_FAILURE'

export function loadModelsByUsername(username) {
  return {
    [CALL_API]: {
      types: [ MODELS_BY_USERNAME_REQUEST, MODELS_BY_USERNAME_SUCCESS, MODELS_BY_USERNAME_FAILURE ],
      endpoint: `models/username/${username}`,
      schema: Schemas.MODELS_RESPONSE
    }
  }
}

export const MODEL_BY_USERNAME_AND_SLUG_REQUEST = 'MODEL_BY_USERNAME_AND_SLUG_REQUEST'
export const MODEL_BY_USERNAME_AND_SLUG_SUCCESS = 'MODEL_BY_USERNAME_AND_SLUG_SUCCESS'
export const MODEL_BY_USERNAME_AND_SLUG_FAILURE = 'MODEL_BY_USERNAME_AND_SLUG_FAILURE'

export function loadModelByUsernameAndSlug(username, slug) {
  return {
    [CALL_API]: {
      types: [ MODEL_BY_USERNAME_AND_SLUG_REQUEST, MODEL_BY_USERNAME_AND_SLUG_SUCCESS, MODEL_BY_USERNAME_AND_SLUG_FAILURE ],
      endpoint: `model/username/${username}/slug/${slug}`,
      schema: Schemas.MODEL_RESPONSE
    }
  }
}

