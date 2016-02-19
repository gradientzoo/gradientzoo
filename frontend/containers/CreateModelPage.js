import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import { createModel } from '../actions/model'
import { bindAll } from 'lodash/util'
import { isNull } from 'lodash/lang'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class CreateModelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      slug: '',
      name: '',
      description: '',
      visibility: 'public'
    }
    bindAll(this, 'handleSubmit', 'handleSlugChange', 'handleNameChange',
      'handleDescriptionChange', 'handleVisibilityChange');
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.created && nextProps.created) {
      // If we've logged in, send the user to their dashboard
      const { authUser: { username } } = this.props
      const { slug } = this.state
      this.props.push(`/${username}/${slug}`)
    }
  }

  handleSlugChange(ev) {
    this.setState({slug: ev.target.value})
  }

  handleNameChange(ev) {
    this.setState({name: ev.target.value})
  }

  handleDescriptionChange(ev) {
    this.setState({description: ev.target.value})
  }

  handleVisibilityChange(ev) {
    this.setState({visibility: ev.target.value})
  }

  handleSubmit(ev) {
    ev.preventDefault();

    if (this.state.description >= 200) {
      return
    }

    const { slug, name, description, visibility } = this.state
    this.props.createModel(slug, name, description, visibility)
  }

  render() {
    const errClass = this.props.error ? ' has-error' : ''
    const { visibility, description } = this.state
    return (
      <DocumentTitle title='Create Model - Gradientzoo'>
      <div className="container" style={styles.page}>
        <NavHeader activeTab='create-model' />

        <h2>Create Model</h2>

        {this.props.error ?
          <div className="alert alert-danger" role="alert">
            <strong>Error</strong> {this.props.error}
          </div> : null}

        <form onSubmit={this.handleSubmit} className="clearfix">
          <div className={'form-group' + errClass}>
            <label htmlFor="slug">Model slug</label>
            <input className="form-control"
                   type="text"
                   name="slug"
                   disabled={this.props.creating}
                   placeholder="Model slug"
                   onChange={this.handleSlugChange} />
          </div>

          <div className={'form-group' + errClass}>
            <label htmlFor="name">Model name</label>
            <input className="form-control"
                   type="text"
                   name="name"
                   disabled={this.props.creating}
                   placeholder="Model name"
                   onChange={this.handleNameChange} />
          </div>

          <div className={'form-group' + errClass + (description.length > 200 ? ' has-error' : '')}>
            <label htmlFor="description">Short description{description ? ' (' + (200 - description.length) + ' left)' : ''}</label>
            <textarea className="form-control"
                      style={styles.descriptionTextarea}
                      type="text"
                      name="description"
                      disabled={this.props.creating}
                      ref="description"
                      placeholder="Short description (optional)"
                      onChange={this.handleDescriptionChange} />
          </div>

          <div className={'form-group' + errClass}>
            <div className="radio">
            <label>
              <input type="radio"
                     name="visibility"
                     value="public"
                     checked={visibility === 'public'}
                     onChange={this.handleVisibilityChange} />
              Public
            </label>
            </div>

            <div className="radio">
            <label>
              <input type="radio"
                     name="visibility"
                     value="private"
                     checked={visibility === 'private'}
                     onChange={this.handleVisibilityChange} />
              Private
            </label>
            </div>
          </div>

          {this.props.creating ?
            <span className="btn btn-default pull-right">Creating...</span> :
            <button type="submit" className="btn btn-default pull-right">Create</button>}
        </form>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

CreateModelPage.propTypes = {
  authTokenId: PropTypes.string,
  creating: PropTypes.bool,
  created: PropTypes.bool,
  error: PropTypes.string,
  push: PropTypes.func.isRequired,
  createModel: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId,
    authUser: state.authUserId ? state.entities.users[state.authUserId] : null,
    creating: state.createModel.creating,
    created: state.createModel.created,
    error: state.createModel.createError
  }
}

export default Radium(connect(mapStateToProps, {
  createModel,
  push,
})(CreateModelPage))
