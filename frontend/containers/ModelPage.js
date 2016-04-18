import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import bindAll from 'lodash/bindAll'
import filter from 'lodash/filter'
import head from 'lodash/head'
import each from 'lodash/each'
import map from 'lodash/map'
import DocumentTitle from 'react-document-title'
import { loadUserByUsername } from '../actions/auth'
import { loadModelByUsernameAndSlug, updateModelReadme, deleteModel } from '../actions/model'
import { loadFilesByUsernameAndSlug } from '../actions/file'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import FileList from '../components/FileList'
import IntegrationHelper from '../components/IntegrationHelper'
import CustomMarkdown from '../components/CustomMarkdown'
import ReadmeEditor from '../components/ReadmeEditor'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'
import 'isomorphic-fetch'


class ModelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {readmeLater: false, editReadme: false}
    bindAll(this, 'handleReadmeChange', 'handleReadmeLater', 'handleEditClick',
      'handleDeleteClick', 'handleFileClick')
  }

  componentWillReceiveProps(nextProps) {
    // If we've deleted successfully, send them back to their profile page
    if (this.props.deleting && !nextProps.deleting && !nextProps.deleteError) {
      const { push, routeParams: { username } } = this.props
      push('/' + username)
    }
  }

  componentWillMount() {
    const { routeParams: { username, slug }} = this.props
    this.props.loadModelByUsernameAndSlug(username, slug)
    this.props.loadFilesByUsernameAndSlug(username, slug)
    this.props.loadUserByUsername(username)
  }

  handleReadmeChange(readme) {
    this.setState({editReadme: false});
    this.props.updateModelReadme(this.props.model.id, readme)
  }

  handleReadmeLater(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.setState({readmeLater: true, editReadme: false})
  }

  handleEditClick(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.setState({editReadme: true});
  }

  handleDeleteClick(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    if (this.props.deleting) {
      return
    }
    if (!confirm('Warning: This cannot be undone! Now, are you absolutely sure you want to delete this model?')) {
      return
    }
    this.props.deleteModel(this.props.model.id)
  }

  handleFileClick(file, ev) {
    ev.stopPropagation()
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
    const { routeParams: { username, slug }, authTokenId} = this.props
    const { user, authUser } = this.props
    const { model, modelFetching, modelFetchError } = this.props
    const { files, filesFetching, filesFetchError } = this.props
    const { deleting, deleteError } = this.props
    const { readmeLater, editReadme } = this.state
    const isOwner = user && authUser && user.id === authUser.id
    const modelLoaded = !modelFetching && model;
    return (
      <DocumentTitle title={username + '/' + slug + ' - Gradientzoo'}>
      <div className="container" style={styles.page}>

        <NavHeader activeTab='none' />

        <h2>
          <Link to={'/' + username}>{username}</Link> /{' '}
          {slug}{' '}
          {model ? <span style={styles.modelDescription}>{model.name}</span>: null}
        </h2>
        {/*model && ? <span>{model.createdTime}</span> : null*/}
        {model ? <p>{model.description}</p> : null}
        {model && user && model.userId === user.id ?
          <IntegrationHelper username={username}
                             slug={slug}
                             authTokenId={authTokenId} /> : null}

        <h3>Files</h3>
        <table className="table">
          <FileList files={files}
                    filesFetching={filesFetching}
                    error={filesFetchError}
                    username={username}
                    modelSlug={slug}
                    showDetails={false}
                    onFileClick={this.handleFileClick} />
        </table>

        {/* If the model is loaded, but doesn't have a readme, and the user hasn't
            clicked the 'later' button, then show the readme creation dialog. */}
        { isOwner && modelLoaded && !model.readme && !readmeLater ?
          <div className="alert alert-info" role="alert">
            <strong>Next step:</strong> Next step: let&rsquo;s create a readme for your model!
          </div>: null}
        { isOwner && modelLoaded && ((!model.readme && !readmeLater) || editReadme) ?
          <ReadmeEditor initialReadme={model.readme}
                        onChange={this.handleReadmeChange}
                        onLaterClick={this.handleReadmeLater} /> : null}

        {/* If the model is loaded and does have a readme, show it */}
        { modelLoaded && model.readme && !editReadme ?
          <div>
            <h3>Readme {isOwner ? <a href="#" style={{fontSize: 14}} onClick={this.handleEditClick}>Edit</a> : null}</h3>
            <div className="well">
              <CustomMarkdown source={model.readme} />
            </div>
          </div> : null}

        { isOwner && modelLoaded && model.readme && !editReadme ?
          <div className="row">
            <div className="col-md-2">
              <a href="#"
                 className={'btn btn-danger' + (deleting ? ' disabled' : '')}
                 onClick={this.handleDeleteClick}>Delete Model</a>
            </div>
            <div className="col-md-10 ">
              { deleteError ? <h4 className="text-danger">{deleteError}</h4> : null}
            </div>
          </div> : null}
        
        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

ModelPage.propTypes = {
  authTokenId: PropTypes.string,
  authUser: PropTypes.object,
  user: PropTypes.object,
  userFetching: PropTypes.bool,
  userFetchError: PropTypes.string,
  model: PropTypes.object,
  modelFetching: PropTypes.bool,
  modelFetchError: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.object),
  filesFetching: PropTypes.bool,
  filesFetchError: PropTypes.string,
  deleting: PropTypes.bool,
  deleteError: PropTypes.string,
  routeParams: PropTypes.object,
  loadUserByUsername: PropTypes.func.isRequired,
  loadModelByUsernameAndSlug: PropTypes.func.isRequired,
  loadFilesByUsernameAndSlug: PropTypes.func.isRequired,
  updateModelReadme: PropTypes.func.isRequired,
  deleteModel: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { routeParams: { username, slug }} = props
  const authUser = state.authUserId ? state.entities.users[state.authUserId] : null
  
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
      if (file.status === 'latest' &&
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
    modelFetching: state.modelByUsernameAndSlug.fetching,
    modelFetchError: state.modelByUsernameAndSlug.fetchError,
    filesFetching: state.filesByUsernameAndSlug.fetching,
    filesFetchError: state.filesByUsernameAndSlug.fetchError,
    deleting: state.deleteModel.deleting,
    deleteError: state.deleteModel.deleteError,
    authUser,
    user,
    model,
    files
  }
}

export default Radium(connect(mapStateToProps, {
  loadUserByUsername,
  loadModelByUsernameAndSlug,
  loadFilesByUsernameAndSlug,
  updateModelReadme,
  deleteModel,
  push
})(ModelPage))
