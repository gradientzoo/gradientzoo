import * as ModelActionTypes from '../actions/model'

const initialCreateModelState = {
  creating: false,
  createError: null,
  created: false
}
export function createModel(state = initialCreateModelState, action) {
  if (action.type === ModelActionTypes.CREATE_REQUEST) {
    return {creating: true, createError: null, created: false}
  }
  if (action.type === ModelActionTypes.CREATE_SUCCESS) {
    return {creating: false, createError: null, created: true}
  }
  if (action.type === ModelActionTypes.CREATE_FAILURE) {
    return {creating: false, createError: action.error, created: false}
  }
  return state
}