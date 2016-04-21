import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { login } from '../actions/auth'
import { bindAll } from 'lodash/util'
import { isNull } from 'lodash/lang'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class LoginPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailOrUsername: '',
      password: ''
    }
    bindAll(this, 'handleSubmit', 'handleEmailOrUsernameChange',
      'handlePasswordChange');
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.authTokenId)
    if (!isNull(nextProps.authTokenId)) {
      // If we've logged in, send the user to their dashboard
      browserHistory.push('/')
    }
  }

  handleEmailOrUsernameChange(ev) {
    this.setState({emailOrUsername: ev.target.value})
  }

  handlePasswordChange(ev) {
    this.setState({password: ev.target.value})
  }

  handleSubmit(ev) {
    ev.preventDefault();

    const { emailOrUsername, password } = this.state
    this.props.login(emailOrUsername, password)
  }

  render() {
    const errClass = this.props.loginError ? ' has-error' : ''
    return (
      <DocumentTitle title="Login - Gradientzoo">
      <div className="container" style={styles.page}>

        <NavHeader activeTab='login' />

        <h2>Login</h2>

        {this.props.loginError ?
          <div className="alert alert-danger" role="alert">
            <strong>Error</strong> {this.props.loginError}
          </div> : null}

        <form onSubmit={this.handleSubmit} className="clearfix">
          <div className={'form-group' + errClass}>
            <label htmlFor="email">Email address or Username</label>
            <input className="form-control"
                   type="text"
                   name="email"
                   disabled={this.props.loggingIn}
                   placeholder="Email address or Username"
                   onChange={this.handleEmailOrUsernameChange} />
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
            <span className="btn btn-default pull-right">Logging in...</span> :
            <button type="submit" className="btn btn-default pull-right">Login</button>}
        </form>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

LoginPage.propTypes = {
  authTokenId: PropTypes.any,
  loggingIn: PropTypes.bool,
  loginError: PropTypes.string,
  login: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId,
    loggingIn: state.login.loggingIn,
    loginError: state.login.loginError
  }
}

export default Radium(connect(mapStateToProps, {
  login
})(LoginPage))
