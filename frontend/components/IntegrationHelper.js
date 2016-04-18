import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import map from 'lodash/map'
import bindAll from 'lodash/bindAll'
import styles from '../styles'
import CustomMarkdown from './CustomMarkdown'

const kerasSource = `
\`\`\`python
from gradientzoo.keras_client import KerasGradientzoo, NotFoundError

# Note: For better security, instead of passing auth_token_id as an argument,
# use the environment variable GRADIENTZOO_AUTH_TOKEN_ID instead
zoo = KerasGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}')

# Load latest weights from Gradientzoo
try:
    zoo.load(your_model)
except NotFoundError:
    pass  # Either allow this error (first time, perhaps) or treat as exception

# Save updated weights to Gradientzoo after each epoch
your_model.fit(X_train,
               Y_train,
               # ...
               callbacks=[zoo.make_callback(your_model, after_epochs=1)])
\`\`\`
`

const tfSource = `
\`\`\`python
from gradientzoo.tensorflow_client import TensorflowGradientzoo, NotFoundError

# Note: For better security, instead of passing auth_token_id as an argument,
# use the environment variable GRADIENTZOO_AUTH_TOKEN_ID instead
zoo = TensorflowGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}')

# Load latest weights from Gradientzoo
try:
    zoo.load(your_tensorflow_network)
except NotFoundError:
    pass  # Either allow this error (first time, perhaps) or treat as exception

# Train your model ...

# Save updated weights to Gradientzoo
zoo.save(your_tensorflow_network)
\`\`\`
`

const lasagneSource = `
\`\`\`python
from gradientzoo.lasagne_client import LasagneGradientzoo, NotFoundError

# Note: For better security, instead of passing auth_token_id as an argument,
# use the environment variable GRADIENTZOO_AUTH_TOKEN_ID instead
zoo = LasagneGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}')

# Load latest weights from Gradientzoo
try:
    zoo.load(your_lasagne_network)
except NotFoundError:
    pass  # Either allow this error (first time, perhaps) or treat as exception

# Train your model ...

# Save updated weights to Gradientzoo
zoo.save(your_lasagne_network)
\`\`\`
`

class IntegrationHelper extends Component {
  constructor(props) {
    super(props)
    bindAll(this, 'handleClick')
    this.state = {
      activeTabIndex: 0
    }
    this.kinds = ['keras', 'tensorflow', 'lasagne']
    this.integrations = {
      keras: {name: 'Keras', kind: 'keras', source: kerasSource},
      tensorflow: {name: 'Tensorflow', kind: 'tensorflow', source: tfSource},
      lasagne: {name: 'Lasagne', kind: 'lasagne', source: lasagneSource}
    }
  }

  fillTemplate(source) {
    const { username, slug, authTokenId } = this.props
    return source.replace(/\{username\}/g, username)
                 .replace(/\{slug\}/g, slug)
                 .replace(/\{authTokenId\}/g, authTokenId || '')
  }

  handleClick(index, ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.setState({activeTabIndex: index})
  }

  render() {
    const { username, slug, authTokenId } = this.props
    const { activeTabIndex } = this.state
    return (
      <div>
        <h3>Integrations</h3>
        <ul className="nav nav-pills" role="tablist">
          {map(this.kinds, (kind, i) => {
            const integration = this.integrations[kind]
            return (
              <li key={kind}
                  className={i === activeTabIndex ? 'active' : ''}
                  role="presentation">
                <a href="#"
                   aria-controls={integration.name}
                   role="tab"
                   data-toggle="tab"
                   onClick={this.handleClick.bind(this, i)}>{integration.name}</a>
              </li>
            )
          })}
        </ul>
        <div className="tab-content" style={styles.integrationContent}>
          {map(this.kinds, (kind, i) => {
            const integration = this.integrations[kind]
            return (
              <div role="tabpanel"
                   key={kind}
                   className={'tab-pane ' + (i === activeTabIndex ? 'active' : '')}>
                <CustomMarkdown source={this.fillTemplate(integration.source)} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

IntegrationHelper.propTypes = {
  username: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  authTokenId: PropTypes.string.isRequired
}

export default Radium(IntegrationHelper)