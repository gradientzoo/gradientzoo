import React from 'react'
import Radium from 'radium'
import styles from '../styles'
import loadingSpinner from 'file?name=[path][name].[ext]?[hash]!../images/loading-spinner.gif'

export default Radium((props) => {
  if (!props.active) {
    return null
  }
  return <img src={loadingSpinner} style={styles.loadingSpinner} /> 
})