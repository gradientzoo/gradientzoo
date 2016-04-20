import { createStore, applyMiddleware, compose } from 'redux'
import DevTools from '../containers/DevTools'
import thunk from 'redux-thunk'
import auth from '../middleware/auth'
import api from '../middleware/api'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

export default function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, auth.load, api, auth.save, createLogger()),
      DevTools.instrument()
    )
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
