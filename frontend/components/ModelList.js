import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import { Link } from 'react-router'
import map from 'lodash/map'
import bindAll from 'lodash/bindAll'
import styles from '../styles'
import Time from 'react-time'
import DownloadCount from './DownloadCount'

class ModelList extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'renderRow');
  }

  renderRow(model, rowNum) {
    const { models } = this.props
    return (
      <tr key={model.id} style={rowNum === models.length - 1 ? styles.lastModelRow : []}>
        <td>
          {model.url ? <Link to={model.url}>{model.user.username}/{model.slug}</Link> :
                       <span>{model.user.username}/{model.slug}</span>}
        </td>
        <td>
          <span style={styles.modelName}>{model.name}</span>
        </td>
        <td>
          <Time value={model.createdTime}
                format="YYYY/MM/DD"
                relative={true} /> 
        </td>
        <td>
          <DownloadCount downloads={model.downloads} />
        </td>
        <td>
          <span style={styles.modelVisibility}>{model.visibility}</span>
        </td>
      </tr>
    )
  }

  render() {
    const { fetching, showHeaders } = this.props
    if (fetching) {
      return (
        <div>
          <h3>Fetching models...</h3>
        </div>
      )
    }
    return (
      <table className="table" style={styles.modelList}>
        {showHeaders ?
          <thead>
            <tr>
              <th></th>
              <th>Model Name</th>
              <th>Time Created</th>
              <th>Downloads</th>
              <th>Visibility</th>
            </tr>
          </thead> : null}
        <tbody>
          {map(this.props.models, this.renderRow)}
        </tbody>
      </table>
    )
  }
}

ModelList.propTypes = {
  models: PropTypes.arrayOf(PropTypes.object),
  fetching: PropTypes.bool,
  showHeaders: PropTypes.bool,
  error: PropTypes.string
}

export default Radium(ModelList)