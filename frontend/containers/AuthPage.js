import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import { attemptAuth } from '../actions/auth'
import { bindAll } from 'lodash/util'
import { isNull } from 'lodash/lang'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import Radium from 'radium'
import styles from '../styles'

class AuthPage extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'handleSubmit', 'handleEmailChange', 'handlePasswordChange');
  }

  componentWillReceiveProps(nextProps) {
    if (!isNull(nextProps.authTokenId)) {
      // If we've logged in, send the user to their dashboard
      this.props.push('/')
    }
  }

  handleEmailChange(ev) {
    this.setState({email: ev.target.value});
  }

  handlePasswordChange(ev) {
    this.setState({password: ev.target.value});
  }

  handleSubmit(ev) {
    ev.preventDefault();

    const { email, password } = this.state
    this.props.attemptAuth(email, password)

    ReactDOM.findDOMNode(this.refs.password).value = '';
    this.setState({password: ''});
  }

  render() {
    const errClass = this.props.loginError ? ' has-error' : '';
    return (
      <DocumentTitle title='Login or Register - Gradientzoo'>
      <div className="container" style={styles.page}>

        <NavHeader activeTab='auth' />

        {this.props.loginError ?
          <div className="alert alert-danger" role="alert">
            <strong>Error</strong> {this.props.loginError}
          </div> : null}

        <form onSubmit={this.handleSubmit}>
          <div className={'form-group' + errClass}>
            <label htmlFor="email">Email address</label>
            <input className="form-control"
                   type="email"
                   name="email"
                   disabled={this.props.loggingIn}
                   placeholder="Email address"
                   onChange={this.handleEmailChange} />
          </div>
          <div className={'form-group' + errClass}>
            <label htmlFor="password">Password</label>
            <input className="form-control"
                   type="password"
                   name="password"
                   disabled={this.props.loggingIn}
                   ref="password"
                   placeholder="Password"
                   onChange={this.handlePasswordChange} />
          </div>
          {this.props.loggingIn ?
            <span className="btn btn-default">Submitting...</span> :
            <button type="submit" className="btn btn-default">Submit</button>}
        </form>

      </div>
      </DocumentTitle>
    )
  }
}

AuthPage.state = {
  email: '',
  password: ''
}

AuthPage.propTypes = {
  authTokenId: PropTypes.string,
  loggingIn: PropTypes.bool,
  loginError: PropTypes.string,
  attemptAuth: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId,
    loggingIn: state.loggingIn,
    loginError: state.loginError
  }
}

export default Radium(connect(mapStateToProps, {
  attemptAuth,
  push
})(AuthPage))
