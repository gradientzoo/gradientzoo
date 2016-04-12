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
        <Link to={model.url}
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
          <h3>Fetching models...</h3>
        </div>
      )
    }
    console.log('this.props.models.length: ' + this.props.models.length + ' this.props.models.length > 0: ' + (this.props.models.length > 0))
    return (
      <div style={styles.modelList}>
        {this.props.models.length > 0 ?
          <div style={styles.modelRow}>
            <span style={[styles.modelListHeader, {visibility: 'hidden'}]}></span>
            <span style={styles.modelListHeader}>Model Name</span>
            <span style={styles.modelListHeader}>Time Created</span>
            <span style={styles.modelListHeader}>Visibility</span>
          </div> : null}
        {map(this.props.models, this.renderRow)}
      </div>
    )
  }
}

ModelList.propTypes = {
  models: PropTypes.arrayOf(PropTypes.object),
  fetching: PropTypes.bool,
  error: PropTypes.string
}

export default Radium(ModelList)