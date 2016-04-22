import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import { Link } from 'react-router'
import styles from '../styles'

class Footer extends Component {
  render() {
    return (
      <footer className="footer" style={styles.footer}>
        <p className="pull-left">&copy; 2016 Eric Florenzano</p>
        <div className="pull-right">
          <Link to="/open" style={styles.footerItem}>Open Source</Link>
          <Link to="/tos" style={styles.footerItem}>Terms of Service</Link>
          <Link to="/privacy" style={styles.footerItem}>Privacy Policy</Link>
          <a target="_blank"
             href="http://python-gradientzoo.readthedocs.org/en/latest/"
             style={styles.footerItem}>
            Docs
          </a>
          <a target="_blank"
             href="mailto:support@gradientzoo.com"
             style={styles.footerItem}>Support</a>
        </div>
      </footer>
    )
  }
}

export default Radium(Footer)