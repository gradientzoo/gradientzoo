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

  renderRow(file, rowNum) {
    const { username, modelSlug } = this.props
    const rowStyle = [styles.fileRow];
    if (rowNum === 0) {
      rowStyle.push(styles.firstFileRow);
    }
    return (
      <li key={file.id} style={rowStyle} className="row">
        <div className="col-md-3">
          <a href="#" onClick={this.props.onFileClick.bind(this, file)}>{file.filename}</a>
        </div>
        <div className={this.props.showDetails ? 'col-md-2' : 'col-md-3'}>
          <span style={styles.fileFramework}>{file.framework}</span>
        </div>
        <div style={styles.fileSize}
             className={this.props.showDetails ? 'col-md-2' : 'col-md-3'}>
          <span>{filesize(file.sizeBytes)}</span>
        </div>
        {this.props.showDetails ? 
          <div className="col-md-3" style={styles.fileId}>
            {file.id}
          </div> : null}
        <div className="col-md-2" style={styles.fileCreated}>
          <Time 
              value={file.createdTime}
              format="YYYY/MM/DD" relative={true} />          
        </div>
        {this.props.showDetails ? null :
          <div className="col-md-1" style={styles.fileChevron}>
            <Link to={`/${username}/${modelSlug}/${file.framework}/${file.filename}`}
                 className="glyphicon glyphicon-chevron-right"></Link>
          </div>}
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
  username: PropTypes.string.isRequired,
  modelSlug: PropTypes.string.isRequired,
  onFileClick: PropTypes.func.isRequired,
  showDetails: PropTypes.bool
}

export default Radium(FileList)