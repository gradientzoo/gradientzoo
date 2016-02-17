import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import IndexPage from './containers/IndexPage'
import AuthPage from './containers/AuthPage'
import CreateModelPage from './containers/CreateModelPage'

/*
<Route path="/:login/:name"
       component={RepoPage} />
<Route path="/:login"
       component={UserPage} />
*/

export default (
  <Route path="" component={App}>
    <Route path="/auth"
           component={AuthPage} />
    <Route path="/"
           component={IndexPage} />
    <Route path="/create-model"
           component={CreateModelPage} />
  </Route>
)
