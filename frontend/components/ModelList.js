import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import { Link } from 'react-router'
import map from 'lodash/map'
import bindAll from 'lodash/bindAll'
import styles from '../styles'

class ModelList extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'renderRow');
  }

  renderRow(model) {
    return (
      <div key={model.id} style={styles.modelRow}>
        <Link to={'/' + this.props.user.username + '/' + model.slug}
              style={styles.modelSlug}>{model.slug}</Link>
        <span style={styles.modelName}>{model.name}</span>
        <span style={styles.modelCreatedTime}>{model.createdTime}</span>
        <span style={styles.modelVisibility}>{model.visibility}</span>
      </div>
    )
  }

  render() {
    if (this.props.fetching) {
      return (
        <div style={[styles.modelList, styles.modelListFetching]}>
          <p>Fetching models...</p>
        </div>
      )
    }
    return (
      <div style={styles.modelList}>
        {map(this.props.models, this.renderRow)}
      </div>
    )
  }
}

ModelList.propTypes = {
  user: PropTypes.object,
  models: PropTypes.arrayOf(PropTypes.object),
  fetching: PropTypes.bool,
  error: PropTypes.string
}

export default Radium(ModelList)