import { applyDecorators } from '@nestjs/common';
import { getAuthorizationDecorators } from './auth-user.decorator';
import { RoleSection } from '../role/role-section';
import { RolePermission } from '../role/role-permission';

/**
 * Will change needed role to access a resource.
 *
 * NOTE: this is intended to use on function level and use it only if you already
 * applied AuthUser decorator on class level.
 *
 * @param roleSection Role section needed to access a resource.
 * @param rolePermission Role permission needed to access a resource.
 * @returns Applies decorators needed for authorization. Note that it will only
 * apply metadata for authorization (no actual authorization decorators will be
 * added, this is done by AuthUser decorator).
 */
export function AuthUserChange(
  roleSection: RoleSection,
  rolePermission: RolePermission,
) {
  return applyDecorators(
    ...getAuthorizationDecorators(roleSection, rolePermission),
  );
}
