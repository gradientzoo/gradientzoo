import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { isNull } from 'lodash/util'
import toArray from 'lodash/toArray'
import DocumentTitle from 'react-document-title'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class IndexPage extends Component {
  render() {
    const { authUser, models } = this.props
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
            <ModelList models={models} />
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
  return {
    authUser: state.authUserId ? state.entities.users[state.authUserId] : null,
    models: toArray(state.entities.models)
  }
}

export default Radium(connect(mapStateToProps, {})(IndexPage))
