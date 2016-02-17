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