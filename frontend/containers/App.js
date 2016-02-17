import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { restore, loadAuthUser } from '../actions/auth'
import { AUTH_LOADING } from '../reducers'
import DocumentTitle from 'react-document-title'

class App extends Component {
  componentWillMount() {
    this.props.restoreAuth();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.authUserId !== nextProps.authUserId) {
      this.props.loadAuthUser()
    }
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
  authIsLoaded: PropTypes.bool.isRequired,
  authUserId: PropTypes.string,
  restoreAuth: PropTypes.func.isRequired,
  loadAuthUser: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authIsLoaded: state.authTokenId !== AUTH_LOADING,
    authUserId: state.authUserId
  }
}

export default connect(mapStateToProps, {
  restoreAuth: restore,
  loadAuthUser
})(App)
