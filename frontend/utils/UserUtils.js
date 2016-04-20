import map from 'lodash/map'
import extend from 'lodash/extend'

export function addUserUrls(models, users) {
  return map(models, (model) => (extend(model, {
    url: '/' + users[model['userId']].username + '/' + model.slug,
    user: users[model.userId]
  })))
}

export default {
  addUserUrls: addUserUrls
}