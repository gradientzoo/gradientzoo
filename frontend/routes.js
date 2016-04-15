import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import IndexPage from './containers/IndexPage'
import LoginPage from './containers/LoginPage'
import RegisterPage from './containers/RegisterPage'
import StartModelPage from './containers/StartModelPage'
import ProfilePage from './containers/ProfilePage'
import ModelPage from './containers/ModelPage'
import FilePage from './containers/FilePage'

export default (
  <Route path="" component={App}>
    <Route path="/" component={() => React.createElement('span', null, 'Coming Soon...')} />
    <Route path="/login"
           component={LoginPage} />
    <Route path="/register"
           component={RegisterPage} />
    <Route path="/index"
           component={IndexPage} />
    <Route path="/start-model"
           component={StartModelPage} />
    <Route path="/:username"
           component={ProfilePage} />
    <Route path="/:username/:slug/:framework/:filename"
           component={FilePage} />
    <Route path="/:username/:slug"
           component={ModelPage} />
  </Route>
)
