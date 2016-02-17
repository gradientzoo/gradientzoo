import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { loadAuthUser, logout } from '../actions/auth'
import isString from 'lodash/isString'
import bindAll from 'lodash/bindAll'
import Radium from 'radium'
import styles from '../styles'

class NavHeader extends Component {
  componentWillMount() {
    bindAll(this, 'handleLogout')
  }

  handleLogout(ev) {
    ev.preventDefault()
    this.props.logout()
  }

  render() {
    const { activeTab, isLoggedIn } = this.props
    const homeActiveClass = activeTab === 'home' ? 'active' : ''
    const authActiveClass = activeTab === 'auth' ? 'active' : ''
    return (
      <div className="header clearfix" style={styles.header}>
        <nav>
          <ul className="nav nav-pills pull-right">
            <li htmlRole="presentation" className={homeActiveClass}><Link to="/">Home</Link></li>
            <li htmlRole="presentation" className={authActiveClass}>
              {isLoggedIn ?
                <a href="#" onClick={this.handleLogout}>Logout</a> :
                <Link to="/auth">Login</Link>}
            </li>
          </ul>
        </nav>
        <h3 class="text-muted" style={styles.masthead}>Gradientzoo</h3>
      </div>
    )
  }
}

NavHeader.PropTypes = {
  activeTab: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    isLoggedIn: isString(state.authUserId) && state.authUserId.length > 0
  }
}

export default Radium(connect(mapStateToProps, {
  logout
})(NavHeader))
