import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import bindAll from 'lodash/bindAll'
import filter from 'lodash/filter'
import head from 'lodash/head'
import map from 'lodash/map'
import DocumentTitle from 'react-document-title'
import { loadUserByUsername } from '../actions/auth'
import { loadModelByUsernameAndSlug, updateModelReadme, deleteModel } from '../actions/model'
import { loadFilesByUsernameAndSlug } from '../actions/file'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import ReadmeEditor from '../components/ReadmeEditor'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'
import Markdown from 'react-remarkable'
import Time from 'react-time'

import hljs from 'highlight.js/lib/highlight'
import hljs_javascript from 'highlight.js/lib/languages/javascript'
import hljs_python from 'highlight.js/lib/languages/python'
hljs.registerLanguage('javascript', hljs_javascript)
hljs.registerLanguage('python', hljs_python)

const remarkableConfig = {
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {}

    return '' // use external default escaping
  }
}

const kerasIntegration = `
\`\`\`python
from keras_gradientzoo import KerasGradientzoo
# Note: For better security, pass this auth token id as an environment variable
#       or read it from a file whose access can be restricted.
zoo = KerasGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}')

# Load latest weights from Gradientzoo
zoo.load_weights(your_keras_model)

# Save updated weights to Gradientzoo after each epoch
save_weights = zoo.make_save_callback(your_keras_model)
your_keras_model.fit(X_train, t_train, nb_epoch=3, batch_size=16,
                     callbacks=[save_weights])
\`\`\`
`

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
    this.setState({readmeLater: true, editReadme: false})
  }

  handleEditClick(ev) {
    this.setState({editReadme: true});
  }

  handleDeleteClick(ev) {
    ev.preventDefault()
    if (this.props.deleting) {
      return
    }
    if (!confirm('Warning: This cannot be undone! Now, are you absolutely sure you want to delete this model?')) {
      return
    }
    this.props.deleteModel(this.props.model.id)
  }

  handleFileClick(ev) {
    ev.preventDefault()
  }

  render() {
    const { routeParams: { username, slug }, user, authTokenId} = this.props
    const { model, modelFetching, modelFetchError } = this.props
    const { files, filesFetching, filesFetchError } = this.props
    const { deleting, deleteError } = this.props
    const { readmeLater, editReadme } = this.state
    const modelLoaded = !modelFetching && model
    const keras = kerasIntegration
      .replace(/\{username\}/g, username)
      .replace(/\{slug\}/g, slug)
      .replace(/\{authTokenId\}/g, authTokenId);
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
          <div>
            <h3>Keras Integration</h3>
            <Markdown source={keras} options={remarkableConfig} />
          </div>: null}

        { files && !filesFetching ?
          <div>
            <h3>Files</h3>
            <ul style={styles.fileList}>
              {map(files, file => {
                return (
                  <li key={file.id} style={styles.fileRow} className="row">
                    <div className="col-md-3">
                      <a href="#" onClick={this.handleFileClick}>{file.filename}</a>
                    </div>
                    <div className="col-md-3">
                      <span style={styles.fileKind}>{file.kind}</span>
                    </div>
                    <div className="col-md-6" style={styles.fileCreated}>
                      <Time 
                          value={file.createdTime}
                          format="YYYY/MM/DD" relative={true} />
                    </div>
                    
                    
                    
                  </li>
                )
              })}
            </ul>
          </div> : null}

        {/* If the model is loaded, but doesn't have a readme, and the user hasn't
            clicked the 'later' button, then show the readme creation dialog. */}
        { modelLoaded && !model.readme && !readmeLater ?
          <div className="alert alert-info" role="alert">
            <strong>Next step:</strong> Next step: let&rsquo;s create a readme for your model!
          </div>: null}
        { modelLoaded && ((!model.readme && !readmeLater) || editReadme) ?
          <ReadmeEditor onChange={this.handleReadmeChange}
                        onLaterClick={this.handleReadmeLater} /> : null}

        {/* If the model is loaded and does have a readme, show it */}
        { modelLoaded && model.readme && !editReadme ?
          <div>
            <h3>Readme <a href="#" style={{fontSize: 14}} onClick={this.handleEditClick}>Edit</a></h3>
            <div className="well">
              <Markdown source={model.readme} options={remarkableConfig} />
            </div>
          </div> : null}

        { modelLoaded && model.readme && !editReadme ?
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
  // TODO: Use reselect instead of filtering through all users
  const user = head(filter(state.entities.users, (u) => u.username === username)) || null
  const model = user ? head(filter(state.entities.models, (m) => m.userId === user.id && m.slug === slug)) : null
  const files = model ? filter(state.entities.files, (f) => f.modelId === model.id) : null
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
