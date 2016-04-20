import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../routes'
import { Router } from 'react-router'
import ga from 'react-ga'

const gaid = process.env.GOOGLE_ANALYTICS_ID
if (gaid) {
  ga.initialize(gaid)
}

function logPageView() {
  if (gaid) {
    ga.pageview(this.state.location.pathname)
  }
}

export default class Root extends Component {
  render() {
    const { store, history } = this.props
    return (
      <Provider store={store}>
        <Router history={history} routes={routes} onUpdate={logPageView} />
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}
