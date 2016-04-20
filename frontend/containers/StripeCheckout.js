import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import StripeCheckout from 'react-stripe-checkout'
import { updateStripe } from '../actions/auth'
import { bindAll } from 'lodash/util'
import Radium from 'radium'
import styles from '../styles'

const stripeKey = (process.env.NODE_ENV === 'production' ?
  process.env.STRIPE_PUBKEY_LIVE :
  process.env.STRIPE_PUBKEY_TEST)


class _StripeCheckout extends Component {
  componentWillMount() {
    bindAll(this, 'handleToken')
  }

  handleToken(token) {
    this.props.updateStripe(token.id)
  }

  render() {
    const params = { amount: this.props.amount }
    return (
      <StripeCheckout token={this.handleToken}
                      stripeKey={stripeKey}
                      {...params}>
        <a className="btn btn-primary">Enter Payment Information</a>
      </StripeCheckout>
    )
  }
}

_StripeCheckout.PropTypes = {
  authTokenId: PropTypes.any,
  updateStripe: PropTypes.func.isRequired,
  amount: PropTypes.int
}

function mapStateToProps(state, props) {
  return {
    authTokenId: state.authTokenId
  }
}

export default Radium(connect(mapStateToProps, {
  updateStripe
})(_StripeCheckout))
