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

      <NavHeader activeTab='open' />

      <h2 className="text-center">
        Gradientzoo and Open Source
      </h2>

      <br className="br" />

      <div className="row">
        <div className="col-md-8 col-md-offset-2">
          <p>
            At Gradientzoo, we believe in open source.  Open source code generates,
            consumes, and formats the data you&rsquo;ll find on this site.  Without
            open source, the field of machine learning might be locked away in
            academic institutions, instead of seeing increasingly widespread use
            across the industry.
          </p>
          <br className="br" />
          <p>
            Because of this, we have decided to open source our entire stack.
            This means that you can read, modify, and contribute to the code
            that generates this website, that powers our API, and that
            integrates with popular machine learning frameworks and libraries.
            Everything we do is open source, and it will continue to be, as
            long as gradientzoo.com exists.
          </p>
          <br className="br" />
          <p>
            But what if gradientzoo.com ceases to exist? What if the pricing
            model doesn&rsquo;t work, or people don&rsquo;t show up, or some
            other site comes along and is somehow better? Thanks to open
            source, you have everything you need to run your own version of
            Gradientzoo, either on-premise or in the cloud. That means much
            less lock-in risk for you.
          </p>
          <br className="br" />
          <p>
            Simply put, it&rsquo;s the right thing to do.
          </p>
          <br className="br" />
          <div className="text-center">
            <a href="https://github.com/gradientzoo" className="btn btn-primary">Visit Our GitHub Page</a>
          </div>
          <br className="br" />
        </div>
      </div>
      
      <Footer />
    </div>
    </DocumentTitle>
  )
})