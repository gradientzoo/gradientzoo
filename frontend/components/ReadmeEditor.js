import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import styles from '../styles'
import bindAll from 'lodash/bindAll'
import each from 'lodash/each'
import TextareaAutosize from 'react-textarea-autosize'
import CustomMarkdown from './CustomMarkdown'

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

* The framework(s) used by this model

### Performance

It achieves 99.5% top-5 error on ABCDEF-2012-val, 97.4% top-5 error on ABCDEF-2012-test.
`.trim()

const STATES = {
  blank: ' ',
  minimal: MINIMAL_TEMPLATE,
  academic: DEFAULT_TEMPLATE
}

class ReadmeEditor extends Component {
  constructor(props) {
    super(props)

    let template = '' // Default to a custom template
    // If there's a readme passed in, let's check to see if it's a default one
    if (props.initialReadme) {
      each(STATES, (source, slug) => {
        // If it is, that's our template slug
        if (source == props.initialReadme) {
          template = slug
          return false
        }
      })
    } else {
      // With no readme passed in, default to the minimal template
      template = 'minimal'
    }
    
    this.state = {template: template, readme: props.initialReadme || STATES['minimal']}
    bindAll(this, 'handleTemplateChange', 'handleReadmeChange', 'handleSubmit',
      'handleCancelClick')
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
    ev.stopPropagation()

    let { readme } = this.state
    if (readme === '') {
      readme = ' '
    }

    if (this.props.onChange) {
      this.props.onChange(readme, ev)
    }
  }

  handleCancelClick(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    this.props.onCancelClick(ev)
  }

  render() {
    const { template, readme } = this.state
    const isCustomized = readme.trim() != (STATES[template] || '').trim()
    return (
      <div>
        <form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
        
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="col-sm-1 control-label"
                   style={styles.readmeTemplateLabel}>Template:</label>
            <div className="col-sm-11">
              <select className="form-control"
                      value={isCustomized ? '' : template}
                      onChange={this.handleTemplateChange}>
                <option value="blank">Blank</option>
                <option value="minimal">Minimal</option>
                <option value="academic">Academic</option>
                {isCustomized ? <option value=""></option> : null}
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
                                value={readme}
                                onChange={this.handleReadmeChange} />
            </div>
            <div className="col-sm-6">
              <CustomMarkdown source={readme} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary pull-right">Save Readme</button>
          {this.props.onCancelClick ?
            <button className="btn btn-default"
                    onClick={this.handleCancelClick}><strong>Cancel</strong></button> : null}
        </form>
      </div>
    )
  }
}

ReadmeEditor.propTypes = {
  initialReadme: PropTypes.string,
  onChange: PropTypes.func,
  onCancelClick: PropTypes.func
}

ReadmeEditor.defaultProps = {
  initialReadme: ''
}

export default Radium(ReadmeEditor)