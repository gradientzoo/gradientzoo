import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { restore } from '../actions/auth'
import { AUTH_LOADING } from '../reducers'
import DocumentTitle from 'react-document-title'

class App extends Component {
  componentWillMount() {
    this.props.restoreAuth();
  }

  render() {
    const { children, inputValue } = this.props
    return (
      <DocumentTitle title='Gradientzoo'>
        <div id="app-root">
          {this.props.authIsLoaded ? children : null}
        </div>
      </DocumentTitle>
    )
  }
}

App.propTypes = {
  children: PropTypes.node,
  restoreAuth: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authIsLoaded: state.authTokenId !== AUTH_LOADING,
  }
}

export default connect(mapStateToProps, {
  restoreAuth: restore
})(App)
