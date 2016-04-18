import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import bindAll from 'lodash/bindAll'
import filter from 'lodash/filter'
import toArray from 'lodash/toArray'
import extend from 'lodash/extend'
import map from 'lodash/map'
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
    const { routeParams: { username }, authUser, user} = this.props
    const { models, modelsFetching, modelsFetchError } = this.props
    const showEmpty = (
      user && authUser && user.id === authUser.id && !modelsFetching &&
      !modelsFetchError && !models.length
    )
    return (
      <DocumentTitle title={username + ' - Gradientzoo'}>
      <div className="container" style={styles.page}>

        <NavHeader activeTab='profile' />

        <h2>{username}&rsquo;s Models</h2>

        <ModelList user={user}
                   models={models}
                   showHeaders={true}
                   fetching={modelsFetching}
                   error={modelsFetchError} />

        {showEmpty ?
          <div className="alert alert-info" role="alert">
            Looks like you haven't started any models yet.{' '}
            <strong>Let's start your first model.</strong><br /><br />
            <Link to="/start-model"
                  className="btn btn-primary">Start Model</Link>
          </div> : null}

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
  const { routeParams: { username } } = props
  const { users, models } = state.entities
  const authUser = state.authUserId ? users[state.authUserId] : null
  // TODO: Use reselect instead of filtering through all users
  const user = head(filter(users, (u) => u.username === username)) || null
  let processedModels = filter(toArray(models), (model) => model.userId === user.id)
  processedModels = map(processedModels, (model) => {
    return extend(model, {
      url: '/' + users[model['userId']].username + '/' + model.slug,
      user: users[model.userId]
    })
  })
  return {
    userFetching: state.userByUsername.fetching,
    userFetchError: state.userByUsername.fetchError,
    modelsFetching: state.modelsByUsername.fetching,
    modelsFetchError: state.modelsByUsername.fetchError,
    models: processedModels,
    authUser,
    user,
  }
}

export default Radium(connect(mapStateToProps, {
  loadUserByUsername,
  loadModelsByUsername
})(ProfilePage))
