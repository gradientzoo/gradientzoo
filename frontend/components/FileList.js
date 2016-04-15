import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import { Link } from 'react-router'
import map from 'lodash/map'
import bindAll from 'lodash/bindAll'
import styles from '../styles'
import Time from 'react-time'
import filesize from 'filesize'

class FileList extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'renderRow');
  }

  renderRow(file) {
    return (
      <li key={file.id} style={styles.fileRow} className="row">
        <div className="col-md-3">
          <a href="#" onClick={this.props.onFileClick.bind(this, file)}>{file.filename}</a>
        </div>
        <div className="col-md-3">
          <span style={styles.fileFramework}>{file.framework}</span>
        </div>
        <div className="col-md-3">
          <span style={styles.fileSize}>{filesize(file.sizeBytes)}</span>
        </div>
        <div className="col-md-3" style={styles.fileCreated}>
          <Time 
              value={file.createdTime}
              format="YYYY/MM/DD" relative={true} />
        </div>
      </li>
    )
  }

  render() {
    if (this.props.fetching) {
      return (
        <div style={styles.fileList}>
          <h3>Fetching files...</h3>
        </div>
      )
    }
    return (
      <ul style={styles.fileList}>
        {map(this.props.files, this.renderRow)}
      </ul>
    )
  }
}

FileList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  fetching: PropTypes.bool,
  error: PropTypes.string,
  onFileClick: PropTypes.func
}

export default Radium(FileList)