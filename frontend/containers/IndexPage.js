import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { isNull } from 'lodash/util'
import toArray from 'lodash/toArray'
import map from 'lodash/map'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import take from 'lodash/take'
import DocumentTitle from 'react-document-title'
import { loadLatestPublicModels, loadTopModels } from '../actions/model'
import NavHeader from './NavHeader'
import ModelList from '../components/ModelList'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import Radium from 'radium'
import styles from '../styles'
import UserUtils from '../utils/UserUtils'

class IndexPage extends Component {
  componentWillMount() {
    this.state = {
      period: 'week'
    }
    this.props.loadLatestPublicModels()
    this.props.loadTopModels(this.state.period)
  }

  handlePeriodClick(period, ev) {
    ev.preventDefault()
    ev.stopPropagation()
    this.setState({period})
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.period !== nextState.period) {
      this.props.loadTopModels(nextState.period)
    }
  }

  render() {
    const { authUser,
            models,
            users,
            latestModelsFetching,
            latestModelsFetchError,
            topModelsFetching,
            topModelsFetchError } = this.props
    const { period } = this.state

    let latestModels = take(reverse(sortBy(models, 'createdTime')), 10)
    latestModels = UserUtils.addUserUrls(latestModels, users)

    let topModels = take(reverse(sortBy(models, 'downloads.all')), 10)
    topModels = UserUtils.addUserUrls(topModels, users)

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
            <h4 className="pull-left">
              Most Downloaded Public Models{' '}
              <LoadingSpinner active={topModelsFetching} />
            </h4>
            {topModelsFetchError ?
              <span style={styles.modelFetchError}>Error loading these models ({topModelsFetchError})</span>: null}
            <h5 className="pull-right">
              (
                {period === 'day' ? 'Day' :
                  <a href="#"
                     onClick={this.handlePeriodClick.bind(this, 'day')}>Day</a>},{' '}
                {period === 'week' ? 'Week' :
                  <a href="#"
                     onClick={this.handlePeriodClick.bind(this, 'week')}>Week</a>},{' '}
                {period === 'month' ? 'Month' :
                  <a href="#"
                     onClick={this.handlePeriodClick.bind(this, 'month')}>Month</a>}, or{' '} 
                {period === 'all' ? 'All Time' :
                  <a href="#"
                     onClick={this.handlePeriodClick.bind(this, 'all')}>All Time</a>}
              )
            </h5>
            <div className="clearfix" />
            <ModelList models={topModels} period={period} />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h4 className="pull-left">
              Latest Public Models{' '}
              <LoadingSpinner active={latestModelsFetching} />
            </h4>
            {latestModelsFetchError ?
              <span style={styles.modelFetchError}>Error loading these models ({latestModelsFetchError})</span>: null}
            <div className="clearfix" />
            <ModelList models={latestModels} />
          </div>
        </div>

        <br className="br" />

        <div className="row">
          <div className="col-md-6">
            <h4>Go back in time</h4>
            <p>Overfit your training data? No problem, change one line of code to pull an older version of the weights and fine tune from there.</p>
            <br className="br" />

            <h4>Copy your neighbor&rsquo;s work</h4>
            <p>Don&rsquo;t waste your time training a model that hundreds of others have already trained and shared, simply pull one from the public models above!</p>
          </div>
          <div className="col-md-6">
            <h4>Private models for your own use</h4>
            <p>Working on something that can&rsquo;t be shared? Start a private model instead of public, and you will be the only one with access to the files.</p>
            <br className="br" />

            <h4>Transfer learning for everyone</h4>
            <p>Trained neural networks can be used outside of their original training domain. Try using a related pre-trained net from Gradientzoo and fine tuning it to fit your use case.</p>
          </div>
        </div>

        <br className="br" />

        <Footer />
      </div>
      </DocumentTitle>
    )
  }
}

IndexPage.propTypes = {
  authUser: PropTypes.object,
  models: PropTypes.arrayOf(PropTypes.object),
  users: PropTypes.object,
  latestModelsFetching: PropTypes.bool,
  latestModelsFetchError: PropTypes.string,
  topModelsFetching: PropTypes.bool,
  topModelsFetchError: PropTypes.string
}

function mapStateToProps(state, props) {
  const { models, users } = state.entities
  const publicModels = filter(toArray(models), (model) => model.visibility === 'public')
  return {
    authUser: state.authUserId ? users[state.authUserId] : null,
    models: publicModels,
    users: users,
    latestModelsFetching: state.latestPublicModels.fetching,
    latestModelsFetchError: state.latestPublicModels.fetchError,
    topModelsFetching: state.topModels.fetching,
    topModelsFetchError: state.topModels.fetchError
  }
}

export default Radium(connect(mapStateToProps, {
  loadLatestPublicModels,
  loadTopModels
})(IndexPage))
