import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { register } from '../actions/auth'
import { bindAll } from 'lodash/util'
import { isNull } from 'lodash/lang'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class RegisterPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      username: '',
      password: ''
    }
    bindAll(this, 'handleSubmit', 'handleEmailChange', 'handleUsernameChange',
      'handlePasswordChange');
  }

  componentWillReceiveProps(nextProps) {
    if (!isNull(nextProps.authTokenId)) {
      // If we've logged in, send the user to their dashboard
      browserHistory.push('/')
    }
  }

  handleEmailChange(ev) {
    this.setState({email: ev.target.value})
  }

  handleUsernameChange(ev) {
    this.setState({username: ev.target.value})
  }

  handlePasswordChange(ev) {
    this.setState({password: ev.target.value})
  }

  handleSubmit(ev) {
    ev.preventDefault();

    const { email, username, password } = this.state
    this.props.register(email, username, password)

    ReactDOM.findDOMNode(this.refs.password).value = ''
    this.setState({password: ''})
  }

  render() {
    const errClass = this.props.registerError ? ' has-error' : ''
    return (
      <DocumentTitle title="Sign Up - Gradientzoo">
      <div className="container" style={styles.page}>

        <NavHeader activeTab='register' />

        <h2>Sign Up</h2>

        {this.props.registerError ?
          <div className="alert alert-danger" role="alert">
            <strong>Error</strong> {this.props.registerError}
          </div> : null}

        <form onSubmit={this.handleSubmit} className="clearfix">
          <div className={'form-group' + errClass}>
            <label htmlFor="email">Email address</label>
            <input className="form-control"
                   type="email"
                   name="email"
                   disabled={this.props.registering}
                   placeholder="Email address"
                   onChange={this.handleEmailChange} />
          </div>

          <div className={'form-group' + errClass}>
            <label htmlFor="username">Username</label>
            <input className="form-control"
                   type="text"
                   name="username"
                   disabled={this.props.registering}
                   placeholder="Username"
                   onChange={this.handleUsernameChange} />
          </div>

          <div className={'form-group' + errClass}>
            <label htmlFor="password">Password</label>
            <input className="form-control"
                   type="password"
                   name="password"
                   disabled={this.props.registering}
                   ref="password"
                   placeholder="Password"
                   onChange={this.handlePasswordChange} />
          </div>

          {this.props.registering ?
            <span className="btn btn-default pull-right">Signing up...</span> :
            <button type="submit" className="btn btn-default pull-right">Sign Up</button>}
        </form>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

RegisterPage.propTypes = {
  authTokenId: PropTypes.any,
  registering: PropTypes.bool,
  registerError: PropTypes.string,
  register: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId,
    registering: state.register.registering,
    registerError: state.register.registerError
  }
}

export default Radium(connect(mapStateToProps, {
  register
})(RegisterPage))
