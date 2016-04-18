import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { isNull } from 'lodash/util'
import toArray from 'lodash/toArray'
import map from 'lodash/map'
import filter from 'lodash/filter'
import extend from 'lodash/extend'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import take from 'lodash/take'
import DocumentTitle from 'react-document-title'
import { loadLatestPublicModels } from '../actions/model'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import Footer from '../components/Footer'
import Radium from 'radium'
import styles from '../styles'

class IndexPage extends Component {
  componentWillMount() {
    if (!this.props.latestModelsFetchedOnce) {
      this.props.loadLatestPublicModels()
    }
  }

  render() {
    const { authUser,
            latestModels,
            latestModelsFetching,
            latestModelsFetchError } = this.props

    return (
      <DocumentTitle title="Gradientzoo: pre-trained neural network models">
      <div className="container" style={styles.page}>
        <NavHeader activeTab="home" />

        <div className="jumbotron">
          <h1>Version and share your trained neural network models</h1>
          <p className="lead">Built-in support for Tensorflow, Keras, and Lasagne. Or integrate directly with our open Python or HTTP APIs!</p>
          <p>
          {authUser ? 
            <Link className="btn btn-lg btn-success"
                  to="/start-model"
                  htmlRole="button">
              Start a model
            </Link> :
            <Link className="btn btn-lg btn-success"
                  to="/register"
                  htmlRole="button">
              Sign up today
            </Link>}
          {' '}
          {authUser ?
            <Link className="btn btn-lg btn-default"
                  to={'/' + authUser.username}
                  htmlRole="button">
              Go to your profile &raquo;
            </Link> : null}
          </p>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h4>Most Downloaded Public Models</h4>
            <ModelList models={latestModels}
                       fetching={latestModelsFetching}
                       error={latestModelsFetchError} />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h4>Latest Public Models</h4>
            <ModelList models={latestModels}
                       fetching={latestModelsFetching}
                       error={latestModelsFetchError} />
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
  latestModels: PropTypes.arrayOf(PropTypes.object),
  latestModelsFetching: PropTypes.bool,
  latestModelsFetchError: PropTypes.string,
  latestModelsFetchedOnce: PropTypes.bool
}

function mapStateToProps(state, props) {
  const { models, users } = state.entities

  const publicModels = filter(toArray(models), (model) => model.visibility === 'public')
  const latestModels = take(reverse(sortBy(publicModels, 'createdTime')), 10)
  const latestModelsWithUrls = map(latestModels, (model) => {
    return extend(model, {
      url: '/' + users[model['userId']].username + '/' + model.slug,
      user: users[model.userId]
    })
  })

  return {
    authUser: state.authUserId ? users[state.authUserId] : null,
    latestModels: latestModelsWithUrls,
    latestModelsFetching: state.latestPublicModels.fetching,
    latestModelsFetchError: state.latestPublicModels.fetchError,
    latestModelsFetchedOnce: state.latestPublicModels.fetchedOnce
  }
}

export default Radium(connect(mapStateToProps, {
  loadLatestPublicModels
})(IndexPage))
