import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import bindAll from 'lodash/bindAll'
import filter from 'lodash/filter'
import each from 'lodash/each'
import head from 'lodash/head'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import DocumentTitle from 'react-document-title'
import { loadFileVersions } from '../actions/file'
import { loadModelByUsernameAndSlug } from '../actions/model'
import { loadUserByUsername } from '../actions/auth'
import NavHeader from './NavHeader'
import FileList from '../components/FileList'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import Radium from 'radium'
import styles from '../styles'
import 'isomorphic-fetch'

class FilePage extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'handleFileClick')
  }

  componentWillMount() {
    const { routeParams: { username, slug, framework, filename }} = this.props
    this.props.loadUserByUsername(username)
    this.props.loadModelByUsernameAndSlug(username, slug)
    this.props.loadFileVersions(username, slug, framework, filename)
  }

  handleFileClick(file, ev) {
    ev.preventDefault()
    const { routeParams: { username, slug }, authTokenId} = this.props
    const path = `/api/file-id/${file.id}`
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    if (authTokenId) {
      headers['X-Auth-Token-Id'] = authTokenId
    }
    fetch(path, {headers: headers})
      .then(response => response.json().then(json => ({ json, response })))
      .then(({ json, response }) => {
        if (json && json.url) {
          window.location.assign(json.url)
        }
      })
  }

  render() {
    const { routeParams: { username, slug, framework, filename } } = this.props
    const { files, filesFetching, filesFetchError } = this.props
    return (
      <DocumentTitle title={`${username}/${slug}/${framework}/${filename} - Gradientzoo`}>
      <div className="container" style={styles.page}>

        <NavHeader activeTab='none' />

        <h2>
          <Link to={`/${username}`}>{username}</Link> /{' '}
          <Link to={`/${username}/${slug}`}>{slug}</Link> /{' '}
          {filename}{' '}
          <LoadingSpinner active={filesFetching} />
        </h2>

        <div style={styles.filePageTable}>
          <table className="table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Framework</th>
                <th>Filesize</th>
                <th>Downloads</th>
                <th>ID</th>
                <th>Time Uploaded</th>
              </tr>
            </thead>
            <FileList files={files}
                      filesFetching={filesFetching}
                      error={filesFetchError}
                      username={username}
                      modelSlug={slug}
                      showDetails={true}
                      onFileClick={this.handleFileClick} />
          </table>
        </div>
        
        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

FilePage.propTypes = {
  authTokenId: PropTypes.string,

  user: PropTypes.object,
  userFetching: PropTypes.bool,
  userFetchError: PropTypes.string,

  model: PropTypes.object,
  modelFetching: PropTypes.bool,
  modelFetchError: PropTypes.string,

  files: PropTypes.arrayOf(PropTypes.object),
  filesFetching: PropTypes.bool,
  filesFetchError: PropTypes.string,

  routeParams: PropTypes.object,
  loadUserByUsername: PropTypes.func.isRequired,
  loadModelByUsernameAndSlug: PropTypes.func.isRequired,
  loadFileVersions: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { routeParams: { username, slug, framework, filename }} = props

  const user = head(filter(
    state.entities.users,
    (u) => u.username === username
  ))

  const model = user ? head(filter(
    state.entities.models,
    (m) => m.userId === user.id && m.slug === slug
  )) : null

  const files = []
  if (model) {
    each(state.entities.files, (file) => {
      if (file.framework === framework &&
          file.filename === filename &&
          file.modelId === model.id &&
          file.userId === user.id) {
        files.push(file)
      }
    })
  }  

  return {
    authTokenId: state.authTokenId,

    userFetching: state.userByUsername.fetching,
    userFetchError: state.userByUsername.fetchError,
    user,

    modelFetching: state.modelByUsernameAndSlug.fetching,
    modelFetchError: state.modelByUsernameAndSlug.fetchError,
    model,

    filesFetching: state.fileVersions.fetching,
    filesFetchError: state.fileVersions.fetchError,
    files: reverse(sortBy(files, 'createdTime'))
  }
}

export default Radium(connect(mapStateToProps, {
  loadUserByUsername,
  loadModelByUsernameAndSlug,
  loadFileVersions
})(FilePage))
