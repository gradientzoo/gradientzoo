import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { createModel, loadModelsByUsername } from '../actions/model'
import { bindAll } from 'lodash/util'
import { isNull } from 'lodash/lang'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import Footer from '../components/Footer'
import StripeCheckout from './StripeCheckout'
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
      'handleDescriptionChange', 'handleVisibilityChange', 'handleKeepChange')
  }

  componentDidMount() {
    if (!this.props.authTokenId) {
      browserHistory.push('/login')
    }
    if ((this.props.authUser || {}).username) {
      this.props.loadModelsByUsername(this.props.authUser.username)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.authUser && nextProps.authUser) {
      // If we get their stripe customer id, submit the form
      if (!this.props.authUser.hasStripeCustomerId &&
          nextProps.authUser.hasStripeCustomerId) {
        this.handleSubmit()
      }
      // if the username changes, load the new user (may not be needed)
      if (nextProps.authUser.username != this.props.authUser.username) {
        this.props.loadModelsByUsername(nextProps.authUser.username)
      }
    }
    if (!this.props.created && nextProps.created) {
      // If we've logged in, send the user to their dashboard
      let username = '';
      if (this.props.authUser && this.props.authUser.username) {
        username = this.props.authUser.username
      }
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
    if (ev) {
      ev.preventDefault()
    }

    if (this.state.description >= 200) {
      return
    }

    const { slug, name, description, visibility, keep } = this.state
    this.props.createModel(slug, name, description, visibility, keep)
  }

  handleKeepChange(ev) {
    this.setState({keep: ev.target.value})
  }

  render() {
    const errClass = this.props.error ? ' has-error' : ''
    const { visibility, description, keep } = this.state
    const { authUser } = this.props
    let amount = {
      '100': 500,
      '1000': 5000,
      '10000': 50000
    }[keep] || 0
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

          <div className="form-group">
            <label className="radio-inline" style={styles.vizItem}>
              <input type="radio"
                     name="visibility"
                     value="public"
                     checked={visibility === 'public'}
                     onChange={this.handleVisibilityChange} />
              <span style={styles.vizIcon} className="glyphicon glyphicon-globe"></span>{' '}
              Public
            </label>

            <label className="radio-inline" style={styles.vizItem}>
              <input type="radio"
                     name="visibility"
                     value="private"
                     checked={visibility === 'private'}
                     onChange={this.handleVisibilityChange} />
              <span style={styles.vizIcon} className="glyphicon glyphicon-lock"></span>{' '}
              Private
            </label>
          </div>

          <div className="form-group">
            <label style={styles.planLabel} htmlFor="keep">Plan:</label>
            <label className="radio-inline" style={styles.planItem}>
              <input type="radio"
                     name="keep"
                     value="10"
                     checked={keep === '10'}
                     onChange={this.handleKeepChange} />
              <span style={styles.planFact}>Versions Saved: <span style={styles.planInner}>10</span></span>
              <span style={styles.planFact}>Max File Size: <span style={styles.planInner}>500MB</span></span>
              <span style={styles.planFact}>Price: <span style={styles.planInner}>{this.state.visibility == 'public' ? 'FREE!' : '$2/month'}</span></span>
            </label>
            <label className="radio-inline" style={styles.planItem}>
              <input type="radio"
                     name="keep"
                     value="100"
                     checked={keep === '100'}
                     onChange={this.handleKeepChange} />
              <span style={styles.planFact}>Versions Saved: <span style={styles.planInner}>100</span></span>
              <span style={styles.planFact}>Max File Size: <span style={styles.planInner}>1GB</span></span>
              <span style={styles.planFact}>Price: <span style={styles.planInner}>$5/month</span></span>
            </label>
            <label className="radio-inline"style={styles.planItem}>
              <input type="radio"
                     name="keep"
                     value="1000"
                     checked={keep === '1000'}
                     onChange={this.handleKeepChange} />
              <span style={styles.planFact}>Versions Saved: <span style={styles.planInner}>1000</span></span>
              <span style={styles.planFact}>Max File Size: <span style={styles.planInner}>2GB</span></span>
              <span style={styles.planFact}>Price: <span style={styles.planInner}>$50/month</span></span>
            </label>
            <label className="radio-inline"style={styles.planItem}>
              <input type="radio"
                     name="keep"
                     value="10000"
                     checked={keep === '10000'}
                     onChange={this.handleKeepChange} />
              <span style={styles.planFact}>Versions Saved: <span style={styles.planInner}>10,000</span></span>
              <span style={styles.planFact}>Max File Size: <span style={styles.planInner}>4GB</span></span>
              <span style={styles.planFact}>Price: <span style={styles.planInner}>$500/month</span></span>
            </label>
            <div className="clearfix" />
          </div>

          <div className="pull-right">
            {(!authUser ||
              (keep ==='10' && ((visibility == 'public') || authUser.hasStripeCustomerId)) ||
              (keep != '10' && authUser.hasStripeCustomerId)) ?
              (this.props.creating ?
                <span className="btn btn-default">Creating...</span> :
                <button type="submit" className="btn btn-default">Start Model</button>) :
              <StripeCheckout amount={amount} />}
          </div>
        </form>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

StartModelPage.propTypes = {
  authTokenId: PropTypes.any,
  authUser: PropTypes.object,
  creating: PropTypes.bool,
  created: PropTypes.bool,
  error: PropTypes.string,
  createModel: PropTypes.func.isRequired,
  loadModelsByUsername: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId,
    authUser: state.authUserId ? state.entities.users[state.authUserId] : null,
    creating: state.createModel.creating,
    created: state.createModel.created,
    error: state.createModel.createError,
    loadModelsByUsername: PropTypes.func.isRequired
  }
}

export default Radium(connect(mapStateToProps, {
  createModel,
  loadModelsByUsername
})(StartModelPage))
