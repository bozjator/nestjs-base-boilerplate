export enum ApiMessages {
  INVALID_DATA = 'Invalid data',
  OBJECT_NOT_FOUND = '[PARAM_0] with given id not found',
  RETURNS_CREATED_RECORD_ID = 'Returns the id of the created record',
  RETURNS_AFFECTED_OBJECTS_COUNT = 'Returns affected objects count',
  CANNOT_HAVE_DUPLICATED_ROLE_SECTION = 'User cannot have two roles with the same section',
  DESCRIPTION_UPDATE_USER_ROLES = `
    Send a list of roles to add or preserve, the rest will be removed. 
    Note that user must login again after roles update, because his tokens are not valid anymore.
    Note that user cannot edit himself.
  `,
}
