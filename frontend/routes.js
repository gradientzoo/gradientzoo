import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import IndexPage from './containers/IndexPage'
import LoginPage from './containers/LoginPage'
import RegisterPage from './containers/RegisterPage'
import CreateModelPage from './containers/CreateModelPage'

/*
<Route path="/:login/:name"
       component={RepoPage} />
<Route path="/:login"
       component={UserPage} />
*/

export default (
  <Route path="" component={App}>
    <Route path="/login"
           component={LoginPage} />
    <Route path="/register"
           component={RegisterPage} />
    <Route path="/"
           component={IndexPage} />
    <Route path="/create-model"
           component={CreateModelPage} />
  </Route>
)
