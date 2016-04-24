import React, { Component, PropTypes } from 'react'
import Radium from 'radium'
import map from 'lodash/map'
import each from 'lodash/each'
import keys from 'lodash/keys'
import bindAll from 'lodash/bindAll'
import styles from '../styles'
import CustomMarkdown from './CustomMarkdown'

const kerasSourcePriv = `
\`\`\`python
from gradientzoo import KerasGradientzoo, NotFoundError

# Note: For better security, instead of passing auth_token_id as an argument,
# use the environment variable GRADIENTZOO_AUTH_TOKEN_ID instead
zoo = KerasGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}')

# Load latest weights from Gradientzoo
try:
    zoo.load(your_model)
except NotFoundError:
    pass  # Either allow this error (first time, perhaps) or treat as exception

# Save updated weights to Gradientzoo after each epoch
zoo_callback = zoo.make_callback(your_model)
your_model.fit(X_train, Y_train, # ...
               callbacks=[zoo_callback])
\`\`\`
`

const kerasSourcePub = `
\`\`\`python
from gradientzoo import KerasGradientzoo

# Load latest weights from Gradientzoo
KerasGradientzoo('{username}/{slug}').load(your_model)
\`\`\`
`

const tfSourcePriv = `
\`\`\`python
from gradientzoo import TensorflowGradientzoo, NotFoundError

# Note: For better security, instead of passing auth_token_id as an argument,
# use the environment variable GRADIENTZOO_AUTH_TOKEN_ID instead
zoo = TensorflowGradientzoo('{username}/{slug}', auth_token_id='{authTokenId}')

# Load latest weights from Gradientzoo
try:
    zoo.load(sess)
except NotFoundError:
    pass  # Either allow this error (first time, perhaps) or treat as exception

# Train your model ...

# Save updated weights to Gradientzoo
zoo.save(sess)
\`\`\`
`

const tfSourcePub = `
\`\`\`python
from gradientzoo import TensorflowGradientzoo

# Load latest weights from Gradientzoo
TensorflowGradientzoo('{username}/{slug}').load(sess)
\`\`\`
`

const lasagneSourcePriv = `
\`\`\`python
from gradientzoo import LasagneGradientzoo, NotFoundError

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

const lasagneSourcePub = `
\`\`\`python
from gradientzoo import LasagneGradientzoo

# Load latest weights from Gradientzoo
LasagneGradientzoo('{username}/{slug}').load(your_lasagne_network)
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
      keras: {name: 'Keras', kind: 'keras', priv: kerasSourcePriv, pub: kerasSourcePub},
      tensorflow: {name: 'Tensorflow', kind: 'tensorflow', priv: tfSourcePriv, pub: tfSourcePub},
      lasagne: {name: 'Lasagne', kind: 'lasagne', priv: lasagneSourcePriv, pub: lasagneSourcePub}
    }
  }

  fillTemplate(integration) {
    const { username, slug, authTokenId } = this.props
    const source = authTokenId ? integration.priv : integration.pub
    return source.replace(/\{username\}/g, username)
                 .replace(/\{slug\}/g, slug)
                 .replace(/\{authTokenId\}/g, authTokenId)
  }

  handleClick(index, ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.setState({activeTabIndex: index})
  }

  render() {
    const { username, slug, authTokenId } = this.props
    const { activeTabIndex } = this.state

    const activeKinds = {}
    each(this.props.files || [], (file) => {
      if (!activeKinds[file.framework]) {
        activeKinds[file.framework] = true
      }
    })
    const kinds = keys(activeKinds) || this.kinds

    return (
      <div>
        <h3>Integrations</h3>
        <ul className="nav nav-pills" role="tablist">
          {map(kinds, (kind, i) => {
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
          {map(kinds, (kind, i) => {
            const integration = this.integrations[kind]
            return (
              <div role="tabpanel"
                   key={kind}
                   className={'tab-pane ' + (i === activeTabIndex ? 'active' : '')}>
                <CustomMarkdown source={this.fillTemplate(integration)} />
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
  files: PropTypes.arrayOf(PropTypes.object),
  authTokenId: PropTypes.any
}

export default Radium(IntegrationHelper)