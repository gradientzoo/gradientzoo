import { CALL_API, Schemas } from '../middleware/api'

export const FILES_BY_USERNAME_AND_SLUG_REQUEST = 'FILES_BY_USERNAME_AND_SLUG_REQUEST'
export const FILES_BY_USERNAME_AND_SLUG_SUCCESS = 'FILES_BY_USERNAME_AND_SLUG_SUCCESS'
export const FILES_BY_USERNAME_AND_SLUG_FAILURE = 'FILES_BY_USERNAME_AND_SLUG_FAILURE'

export function loadFilesByUsernameAndSlug(username, slug) {
  return {
    [CALL_API]: {
      types: [ FILES_BY_USERNAME_AND_SLUG_REQUEST, FILES_BY_USERNAME_AND_SLUG_SUCCESS, FILES_BY_USERNAME_AND_SLUG_FAILURE ],
      endpoint: `model/username/${username}/slug/${slug}/latest-files`,
      schema: Schemas.FILES_RESPONSE
    }
  }
}

export const FILE_VERSIONS_REQUEST = 'FILE_VERSIONS_REQUEST'
export const FILE_VERSIONS_SUCCESS = 'FILE_VERSIONS_SUCCESS'
export const FILE_VERSIONS_FAILURE = 'FILE_VERSIONS_FAILURE'

export function loadFileVersions(username, slug, framework, filename) {
  return {
    [CALL_API]: {
      types: [ FILE_VERSIONS_REQUEST, FILE_VERSIONS_SUCCESS, FILE_VERSIONS_FAILURE ],
      endpoint: `file-versions/${username}/${slug}/${framework}/${filename}`,
      schema: Schemas.FILES_RESPONSE
    }
  }
}