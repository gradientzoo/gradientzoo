import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import { Link } from 'react-router'
import map from 'lodash/map'
import bindAll from 'lodash/bindAll'
import styles from '../styles'
import DownloadCount from './DownloadCount'
import Time from 'react-time'
import filesize from 'filesize'

class FileList extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'renderRow')
  }

  renderRow(file, rowNum) {
    const { username, modelSlug, files, period } = this.props
    return (
      <tr key={file.id} style={rowNum === files.length - 1 ? styles.lastFileRow : []}>
        <td>
          <a href="#" onClick={this.props.onFileClick.bind(this, file)}>{file.filename}</a>
        </td>
        <td>
          <span style={styles.fileFramework}>{file.framework}</span>
        </td>
        <td>
          {filesize(file.sizeBytes)}
        </td>
        <td>
          <DownloadCount downloads={file.downloads} period={period} />
        </td>
        {this.props.showDetails ? 
          <td>
            {file.id}
          </td> : null}
        <td>
          <Time value={file.createdTime}
                format="YYYY/MM/DD"
                relative={true} />          
        </td>
        {this.props.showDetails ? null :
          <td>
            <Link to={`/${username}/${modelSlug}/${file.framework}/${file.filename}`}
                 className="glyphicon glyphicon-chevron-right"></Link>
          </td>}
      </tr>
    )
  }

  render() {
    if (this.props.fetching) {
      return (
        <div>
          <h3>Fetching files...</h3>
        </div>
      )
    }
    return (
      <tbody>
        {map(this.props.files, this.renderRow)}
      </tbody>
    )
  }
}

FileList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  fetching: PropTypes.bool,
  error: PropTypes.string,
  username: PropTypes.string.isRequired,
  modelSlug: PropTypes.string.isRequired,
  onFileClick: PropTypes.func.isRequired,
  showDetails: PropTypes.bool,
  period: PropTypes.string
}

FileList.defaultProps = {
  period: 'all'
}

export default Radium(FileList)