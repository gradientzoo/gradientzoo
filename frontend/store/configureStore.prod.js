import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import auth from '../middleware/auth'
import api from '../middleware/api'
import rootReducer from '../reducers'

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk, auth.load, api, auth.save)
  )
}
