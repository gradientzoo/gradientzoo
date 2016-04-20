import React, { Component } from 'react'

import DocumentTitle from 'react-document-title'
import NavHeader from '../containers/NavHeader'
import Footer from './Footer'
import Radium from 'radium'
import styles from '../styles'

export default Radium((props) => {
  return (
    <DocumentTitle title={`Open Source - Gradientzoo`}>
    <div className="container" style={styles.page}>

      <NavHeader activeTab='none' />

      <h2 className="text-center">
        Gradientzoo Privacy Policy
      </h2>

      <p>Coming soon...</p>
      
      <Footer />
    </div>
    </DocumentTitle>
  )
})