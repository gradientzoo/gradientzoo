import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { createModel } from '../actions/model'
import { bindAll } from 'lodash/util'
import { isNull } from 'lodash/lang'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class StartModelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      slug: '',
      name: '',
      description: '',
      visibility: 'public',
      keep: '10'
    }
    bindAll(this, 'handleSubmit', 'handleSlugChange', 'handleNameChange',
      'handleDescriptionChange', 'handleVisibilityChange')
  }

  componentDidMount() {
    if (!this.props.authUser) {
      browserHistory.push('/login')
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.created && nextProps.created) {
      // If we've logged in, send the user to their dashboard
      const { authUser: { username } } = this.props
      const { slug } = this.state
      browserHistory.push(`/${username}/${slug}`)
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

    const { slug, name, description, visibility, keep } = this.state
    this.props.createModel(slug, name, description, visibility, keep)
  }

  handleKeepChange(ev) {
    alert('Coming soon with paid plans!')
  }

  render() {
    const errClass = this.props.error ? ' has-error' : ''
    const { visibility, description, keep } = this.state
    return (
      <DocumentTitle title='Start Model - Gradientzoo'>
      <div className="container" style={styles.page}>
        <NavHeader activeTab='start-model' />

        <h2>Start Model</h2>

        {this.props.error ?
          <div className="alert alert-danger" role="alert">
            <strong>Error</strong> {this.props.error}
          </div> : null}

        <form onSubmit={this.handleSubmit} className="clearfix">
          <div className={'form-group' + errClass}>
            <label htmlFor="name">Model name</label>
            <input className="form-control"
                   type="text"
                   name="name"
                   disabled={this.props.creating}
                   placeholder="Model name"
                   onChange={this.handleNameChange} />
          </div>

          <div className={'form-group' + errClass}>
            <label htmlFor="slug" style={styles.slugLabel}>gradientzoo.com/</label>
            <input className="form-control"
                   style={styles.slugInput}
                   type="text"
                   name="slug"
                   disabled={this.props.creating}
                   placeholder="mnist-cnn"
                   onChange={this.handleSlugChange} />
            <div className="clearfix" />
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

          <div className={'form-group' + errClass}>
            <label htmlFor="keep">How many historical versions to keep:</label>
            <label className="radio-inline" style={{paddingLeft: 40}}>
              <input type="radio"
                     name="keep"
                     value="10"
                     checked={keep === '10'}
                     onChange={this.handleKeepChange} />
              10
            </label>
            <label className="radio-inline">
              <input type="radio"
                     name="keep"
                     value="100"
                     checked={keep === '100'}
                     onChange={this.handleKeepChange} />
              100
            </label>
            <label className="radio-inline">
              <input type="radio"
                     name="keep"
                     value="1000"
                     checked={keep === '1000'}
                     onChange={this.handleKeepChange} />
              1000
            </label>
            <label className="radio-inline">
              <input type="radio"
                     name="keep"
                     value="Unlimited"
                     checked={keep === 'Unlimited'}
                     onChange={this.handleKeepChange} />
              Unlimited
            </label>
          </div>

          {this.props.creating ?
            <span className="btn btn-default pull-right">Creating...</span> :
            <button type="submit" className="btn btn-default pull-right">Start Model</button>}
        </form>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

StartModelPage.propTypes = {
  authTokenId: PropTypes.string,
  creating: PropTypes.bool,
  created: PropTypes.bool,
  error: PropTypes.string,
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
  createModel
})(StartModelPage))
