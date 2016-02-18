import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import bindAll from 'lodash/bindAll'
import filter from 'lodash/filter'
import head from 'lodash/head'
import DocumentTitle from 'react-document-title'
import { loadUserByUsername } from '../actions/auth'
import { loadModelsByUsername } from '../actions/model'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class ProfilePage extends Component {
  /*
  constructor(props) {
    super(props)
    bindAll(this, 'handleSubmit')
  }
  */

  componentWillMount() {
    const { routeParams: { username }} = this.props
    this.props.loadModelsByUsername(username)
    this.props.loadUserByUsername(username)
  }

  render() {
    const { routeParams: { username }, user} = this.props
    const { models, modelsFetching, modelsFetchError } = this.props
    return (
      <DocumentTitle title={username + ' - Gradientzoo'}>
      <div className="container" style={styles.page}>

        <NavHeader activeTab='profile' />

        <h2>{username}&rsquo;s Models</h2>

        <ModelList user={user}
                   models={models}
                   fetching={modelsFetching}
                   error={modelsFetchError} />

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

ProfilePage.propTypes = {
  authUser: PropTypes.object,
  user: PropTypes.object,
  userFetching: PropTypes.bool,
  userFetchError: PropTypes.string,
  models: PropTypes.arrayOf(PropTypes.object),
  modelsFetching: PropTypes.bool,
  modelsFetchError: PropTypes.string,
  routeParams: PropTypes.object,
  loadUserByUsername: PropTypes.func.isRequired,
  loadModelsByUsername: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { routeParams: { username }} = props
  const authUser = state.authUserId ? state.entities.users[state.authUserId] : null
  // TODO: Use reselect instead of filtering through all users
  const user = head(filter(state.entities.users, (u) => u.username === username)) || null
  const models = user ? filter(state.entities.models, (m) => m.userId === user.id) : []
  return {
    userFetching: state.userByUsername.fetching,
    userFetchError: state.userByUsername.fetchError,
    modelsFetching: state.modelsByUsername.fetching,
    modelsFetchError: state.modelsByUsername.fetchError,
    authUser,
    user,
    models,
  }
}

export default Radium(connect(mapStateToProps, {
  loadUserByUsername,
  loadModelsByUsername
})(ProfilePage))
