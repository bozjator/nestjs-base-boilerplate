export enum AuthMessages {
  USER_EXISTS = 'User already exists',
  PASSWORD_CHECK = 'Returns true if current password is valid, false otherwise.',
  PASSWORD_NOT_VALID = 'User current password not valid',
  AUTH_FAILD = 'User credentials not valid or user not found',
  AUTH_SUCCESSFUL = 'Authentication successful and JWT access token returned',
  LOGOUT_SUCCESSFUL = 'Successfully logged out',
  DESCRIPTION_ROLES_LIST = 'Role is a combination of section and permission, e.g. products.read.',
  DESCRIPTION_CHANGE_PASSWORD = 'After password is changed, all user tokens will be removed (he will be logged out from all his sessions).',
}
