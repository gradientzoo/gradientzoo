import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
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
      name: '',
      description: '',
      visibility: 'public'
    }
    bindAll(this, 'handleSubmit', 'handleNameChange', 'handleDescriptionChange',
      'handleVisibilityChange');
  }

  componentWillReceiveProps(nextProps) {
    if (!isNull(nextProps.authTokenId)) {
      // If we've logged in, send the user to their dashboard
      this.props.push('/')
    }
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

  }

  render() {
    const errClass = this.props.error ? ' has-error' : ''
    const { visibility } = this.state
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
            <label htmlFor="name">Model name</label>
            <input className="form-control"
                   type="text"
                   name="name"
                   disabled={this.props.submitting}
                   placeholder="Model name"
                   onChange={this.handleNameChange} />
          </div>

          <div className={'form-group' + errClass}>
            <label htmlFor="description">Description</label>
            <textarea className="form-control"
                      style={styles.descriptionTextarea}
                      type="text"
                      name="description"
                      disabled={this.props.submitting}
                      ref="description"
                      placeholder="Description"
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

          {this.props.submitting ?
            <span className="btn btn-default">Submitting...</span> :
            <button type="submit" className="btn btn-default pull-right">Submit</button>}
        </form>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

CreateModelPage.propTypes = {
  authTokenId: PropTypes.string,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  push: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId,
    submitting: state.submitting,
    error: state.loginError
  }
}

export default Radium(connect(mapStateToProps, {
  push
})(CreateModelPage))
