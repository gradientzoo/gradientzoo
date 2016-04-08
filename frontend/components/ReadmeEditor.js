import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import styles from '../styles'
import bindAll from 'lodash/bindAll'
import TextareaAutosize from 'react-textarea-autosize'
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

const DEFAULT_TEMPLATE = `
## Background

Write down some background information about your model here.

### Paper

    Very Deep Convolutional Papers for Example-Scale Title Recognition
    K. Garfunkel, A. Harmon
    arXiv:1234.5678

### License

Public domain

### Training

Trained on random crops of the ABCD-100 dataset for 2 weeks on 4 TITAN-XYZ video cards.

### Performance

It achieves 99.5% top-5 error on ABCDEF-2012-val, 97.4% top-5 error on ABCDEF-2012-test.

### Supported Platforms

* Python + Keras

### Model Code

\`\`\`python
model = Sequential()
model.add(ZeroPadding2D((1, 1), input_shape=(3, 224, 224)))
model.add(Convolution2D(64, 3, 3, activation='relu'))
model.add(ZeroPadding2D((1,1)))
model.add(Convolution2D(64, 3, 3, activation='relu'))
model.add(MaxPooling2D((2, 2), strides=(2, 2))
\`\`\`
`.trim()

const MINIMAL_TEMPLATE = `
## Background

Write down some background information about your model here.

### License

Public domain

### Supported Platforms

* This model's language and/or framework
`.trim()

const STATES = {
  blank: '',
  default: DEFAULT_TEMPLATE,
  minimal: MINIMAL_TEMPLATE
}

class ReadmeEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {template: 'default', readme: props.initialReadme || STATES['default']}
    bindAll(this, 'handleTemplateChange', 'handleReadmeChange', 'handleSubmit',
      'handleLaterClick')
  }

  handleTemplateChange(ev) {
    const current = this.state.template
    const next = ev.target.value
    if (current === next) {
      return
    }
    if (this.state.readme === STATES[current]) {
      this.setState({template: next, readme: STATES[next]})
      return
    }
    if (confirm('Your current readme changes will be lost, continue?')) {
      this.setState({template: next, readme: STATES[next]})
    }
  }

  handleReadmeChange(ev) {
    this.setState({readme: ev.target.value})
  }

  handleSubmit(ev) {
    ev.preventDefault()
    if (this.props.onChange) {
      this.props.onChange(this.state.readme)
    }
  }

  handleLaterClick(ev) {
    ev.preventDefault()
    this.props.onLaterClick()
  }

  render() {
    return (
      <div>
        <form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
        
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="col-sm-1 control-label"
                   style={styles.readmeTemplateLabel}>Template:</label>
            <div className="col-sm-11">
              <select className="form-control"
                      value={this.state.template}
                      onChange={this.handleTemplateChange}>
                <option value="default">Default</option>
                <option value="blank">Blank</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-6">
              <h3 style={styles.readmeEditorHeading}>
                Editing <a href="http://commonmark.org/help/" target="_blank">Markdown</a>
              </h3>
            </div>
            <div className="col-sm-6">
              <h3 style={styles.readmeEditorHeading}>Preview</h3>
            </div>
            <div className="col-sm-6">
              <TextareaAutosize className="form-control"
                                style={styles.readmeEditorTextarea}
                                type="text"
                                name="readme"
                                ref="readme"
                                value={this.state.readme}
                                onChange={this.handleReadmeChange} />
            </div>
            <div className="col-sm-6">
              <Markdown source={this.state.readme} options={remarkableConfig} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary pull-right">Save Readme</button>
          {this.props.onLaterClick ?
            <button className="btn btn-default"
                    onClick={this.handleLaterClick}>Later</button> : null}
        </form>
      </div>
    )
  }
}

ReadmeEditor.propTypes = {
  initialReadme: PropTypes.string,
  onChange: PropTypes.func,
  onLaterClick: PropTypes.func
}

ReadmeEditor.defaultProps = {
  initialReadme: ''
}

export default Radium(ReadmeEditor)