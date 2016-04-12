import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { isNull } from 'lodash/util'
import toArray from 'lodash/toArray'
import filter from 'lodash/filter'
import extend from 'lodash/extend'
import map from 'lodash/map'
import DocumentTitle from 'react-document-title'
import { loadLatestPublicModels } from '../actions/model'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class IndexPage extends Component {
  componentWillMount() {
    this.props.loadLatestPublicModels()
  }

  render() {
    const { authUser, models, modelsFetching, modelsFetchError } = this.props
    //         Welcome, {authUser ? authUser.email : 'Unknown User'}
    return (
      <DocumentTitle title="Gradientzoo: pre-trained neural network models">
      <div className="container" style={styles.page}>
        <NavHeader activeTab="home" />

        <div className="jumbotron">
          <h1>Version and share your trained neural network models</h1>
          <p className="lead">Built-in support for Keras, Tensorflow, Lasagne, and Theano. Or integrate directly with our HTTP API.</p>
          <p>
          <Link className="btn btn-lg btn-success"
                to="/register"
                htmlRole="button">
            Sign up today
          </Link>
          </p>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h4>Public Datasets</h4>
            <ModelList models={models}
                       fetching={modelsFetching}
                       error={modelsFetchError} />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h4>Subheading</h4>
            <p>Donec id elit non mi porta gravida at eget metus. Maecenas faucibus mollis interdum.</p>

            <h4>Subheading</h4>
            <p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum.</p>

            <h4>Subheading</h4>
            <p>Maecenas sed diam eget risus varius blandit sit amet non magna.</p>
          </div>
        </div>

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

IndexPage.propTypes = {
  authUser: PropTypes.object,
  models: PropTypes.arrayOf(PropTypes.object)
}

function mapStateToProps(state, props) {
  const { models, users } = state.entities
  let processedModels = filter(toArray(models), (model) => model.visibility === 'public')
  processedModels = map(processedModels, (model) => {
    return extend(model, {url: '/' + users[model['userId']].username + '/' + model.slug})
  })
  return {
    authUser: state.authUserId ? users[state.authUserId] : null,
    models: processedModels,
    modelsFetching: state.latestPublicModels.fetching,
    modelsFetchError: state.latestPublicModels.fetchError
  }
}

export default Radium(connect(mapStateToProps, {
  loadLatestPublicModels
})(IndexPage))
