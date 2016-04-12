import { CALL_API, Schemas } from '../middleware/api'

export const CREATE_REQUEST = 'CREATE_REQUEST'
export const CREATE_SUCCESS = 'CREATE_SUCCESS'
export const CREATE_FAILURE = 'CREATE_FAILURE'

export function createModel(slug, name, description, visibility, keep) {
  keep = parseInt(keep, 10)
  return {
    [CALL_API]: {
      types: [ CREATE_REQUEST, CREATE_SUCCESS, CREATE_FAILURE ],
      endpoint: `model/create`,
      payload: {slug, name, description, visibility, keep},
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

export const MODEL_UPDATE_README_REQUEST = 'MODEL_UPDATE_README_REQUEST'
export const MODEL_UPDATE_README_SUCCESS = 'MODEL_UPDATE_README_SUCCESS'
export const MODEL_UPDATE_README_FAILURE = 'MODEL_UPDATE_README_FAILURE'

export function updateModelReadme(modelId, readme) {
  return {
    [CALL_API]: {
      types: [ MODEL_UPDATE_README_REQUEST, MODEL_UPDATE_README_SUCCESS, MODEL_UPDATE_README_FAILURE ],
      endpoint: `model/id/${modelId}/readme`,
      payload: { readme },
      schema: Schemas.MODEL_RESPONSE
    }
  }
}

export const DELETE_MODEL_REQUEST = 'DELETE_MODEL_REQUEST'
export const DELETE_MODEL_SUCCESS = 'DELETE_MODEL_SUCCESS'
export const DELETE_MODEL_FAILURE = 'DELETE_MODEL_FAILURE'

export function deleteModel(modelId) {
  return {
    [CALL_API]: {
      types: [ DELETE_MODEL_REQUEST, DELETE_MODEL_SUCCESS, DELETE_MODEL_FAILURE ],
      endpoint: `model/id/${modelId}/deleted`,
      payload: { id: modelId },
      schema: Schemas.STATUS
    }
  }
}

export const LATEST_PUBLIC_MODELS_REQUEST = 'LATEST_PUBLIC_MODELS_REQUEST'
export const LATEST_PUBLIC_MODELS_SUCCESS = 'LATEST_PUBLIC_MODELS_SUCCESS'
export const LATEST_PUBLIC_MODELS_FAILURE = 'LATEST_PUBLIC_MODELS_FAILURE'

export function loadLatestPublicModels() {
  return {
    [CALL_API]: {
      types: [ LATEST_PUBLIC_MODELS_REQUEST, LATEST_PUBLIC_MODELS_SUCCESS, LATEST_PUBLIC_MODELS_FAILURE ],
      endpoint: `models/public/latest`,
      schema: Schemas.MODELS_USERS_RESPONSE
    }
  }
}