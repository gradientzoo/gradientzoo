import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import styles from '../styles'

class Footer extends Component {
  render() {
    return (
      <footer className="footer" style={styles.footer}>
        <p>&copy; 2016 Eric Florenzano</p>
      </footer>
    )
  }
}

export default Radium(Footer)