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
    const { models, period } = this.props
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
          <DownloadCount downloads={model.downloads} period={period} />
        </td>
        <td>
          <span style={styles.modelVisibility}>{model.visibility}</span>
          {model && model.visibility == 'private' ?
            <span style={styles.modelLock} className="glyphicon glyphicon-lock"></span> : null}
        </td>
      </tr>
    )
  }

  render() {
    const { showHeaders } = this.props
    return (
      <table className="table" style={styles.modelList}>
        {showHeaders ?
          <thead>
            <tr>
              <th></th>
              <th>Model Name</th>
              <th>Started</th>
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
  showHeaders: PropTypes.bool,
  period: PropTypes.string
}

ModelList.defaultProps = {
  period: 'all'
}

export default Radium(ModelList)