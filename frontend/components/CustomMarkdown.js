import React, { Component, PropTypes } from 'react'

import Radium from 'radium'

import Markdown from 'react-remarkable'

import hljs from 'highlight.js/lib/highlight'
import hljs_javascript from 'highlight.js/lib/languages/javascript'
import hljs_python from 'highlight.js/lib/languages/python'
hljs.registerLanguage('javascript', hljs_javascript)
hljs.registerLanguage('python', hljs_python)

const remarkableConfig = {
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {}

    return '' // use external default escaping
  }
}

class CustomMarkdown extends Component {
  render() {
    return <Markdown source={this.props.source} options={remarkableConfig} />
  }
}

CustomMarkdown.propTypes = {
  source: PropTypes.string.isRequired
}

export default Radium(CustomMarkdown)