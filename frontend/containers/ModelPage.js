import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import bindAll from 'lodash/bindAll'
import filter from 'lodash/filter'
import head from 'lodash/head'
import DocumentTitle from 'react-document-title'
import { loadUserByUsername } from '../actions/auth'
import { loadModelByUsernameAndSlug, updateModelReadme } from '../actions/model'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import ReadmeEditor from '../components/ReadmeEditor'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'
import ReactMarkdown from 'react-markdown'

class ModelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {readmeLater: false}
    bindAll(this, 'handleReadmeChange', 'handleReadmeLater')
  }

  componentWillMount() {
    const { routeParams: { username, slug }} = this.props
    this.props.loadModelByUsernameAndSlug(username, slug)
    this.props.loadUserByUsername(username)
  }

  handleReadmeChange(readme) {
    this.props.updateModelReadme(this.props.model.id, readme)
  }

  handleReadmeLater() {
    this.setState({readmeLater: true})
  }

  render() {
    const { routeParams: { username, slug }, user, authTokenId} = this.props
    const { model, modelFetching, modelFetchError } = this.props
    const modelLoaded = !modelFetching && model
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
            <pre>
              from keras_gradientzoo import KerasGradientzoo{'\n'}
              zoo = KerasGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}'){'\n\n'}
              # Load weights from this Gradientzoo model{'\n'}
              zoo.load_weights(your_keras_model){'\n\n'}
              # Save trained weights to this Gradientzoo model{'\n'}
              callback = zoo.make_save_callback(your_keras_model){'\n'}
              your_keras_model.fit(X_train, t_train, nb_epoch=3, batch_size=16, callbacks=[callback])
            </pre>
          </div>: null}

        {/* If the model is loaded, but doesn't have a readme, and the user hasn't
            clicked the 'later' button, then show the readme creation dialog. */}
        { modelLoaded && !model.readme && !this.state.readmeLater ?
          <div className="alert alert-info" role="alert">
            <strong>Next step:</strong> Next step: let&rsquo;s create a readme for your model!
          </div>: null}
        { modelLoaded && !model.readme && !this.state.readmeLater ?
          <ReadmeEditor onChange={this.handleReadmeChange}
                        onLaterClick={this.handleReadmeLater} /> : null}

        {/* If the model is loaded and does have a readme, show it */}
        { modelLoaded && model.readme ?
          <div>
            <h3>Readme</h3>
            <div className="jumbotron">
              <ReactMarkdown source={model.readme} />
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
  routeParams: PropTypes.object,
  loadUserByUsername: PropTypes.func.isRequired,
  loadModelByUsernameAndSlug: PropTypes.func.isRequired,
  updateModelReadme: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { routeParams: { username, slug }} = props
  const authUser = state.authUserId ? state.entities.users[state.authUserId] : null
  // TODO: Use reselect instead of filtering through all users
  const user = head(filter(state.entities.users, (u) => u.username === username)) || null
  const model = user ? head(filter(state.entities.models, (m) => m.userId === user.id && m.slug === slug)) : null
  return {
    authTokenId: state.authTokenId,
    userFetching: state.userByUsername.fetching,
    userFetchError: state.userByUsername.fetchError,
    modelFetching: state.modelByUsernameAndSlug.fetching,
    modelFetchError: state.modelByUsernameAndSlug.fetchError,
    authUser,
    user,
    model,
  }
}

export default Radium(connect(mapStateToProps, {
  loadUserByUsername,
  loadModelByUsernameAndSlug,
  updateModelReadme
})(ModelPage))
