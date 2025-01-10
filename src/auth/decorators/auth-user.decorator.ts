import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleSection } from '../role/role-section';
import { RolePermission } from '../role/role-permission';
import { AuthGuardJwt } from '../guards/auth-jwt.guard';

export const META_KEY_ROLE_SECTION = 'role_section';
export const META_KEY_ROLE_PERMISSION = 'role_permission';

/**
 * Creates list of decorators for authorization for given role.
 *
 * NOTE: do not use it directly, it is only intended for use by AuthUser and
 * AuthUserChange, because it will not apply decorators for triggering
 * authorization.
 *
 * @param roleSection Role section needed to access a resource.
 * @param rolePermission Role permission needed to access a resource.
 * @returns List of authorization decorators.
 */
export function getAuthorizationDecorators(
  roleSection?: RoleSection,
  rolePermission?: RolePermission,
) {
  if (roleSection !== undefined && rolePermission === undefined) {
    rolePermission = RolePermission.read;
  }

  const decorators: any = [
    SetMetadata(META_KEY_ROLE_SECTION, roleSection),
    SetMetadata(META_KEY_ROLE_PERMISSION, rolePermission),
  ];

  if (roleSection !== undefined) {
    const role = `${roleSection}.${rolePermission}`;
    decorators.push(
      ApiForbiddenResponse({
        description: `Forbidden (required role: ${role})`,
      }),
    );
  }

  return decorators;
}

/**
 * Protects route by checking access token and user roles.
 *
 * If no role for a resource is set, then it is assumed that no role is needed
 * to access a resource.
 *
 * NOTE: if only 'roleSection' is set, 'rolePermission' will be set to 'read'.
 *
 * WARNING: if you use this decorator on class level, do not use it again on
 * function level to change the role permission, because then authentication
 * and authorization will happen twice. Instead use the AuthUserChange
 * decorator to change role permission on function level.
 *
 * @param roleSection Role section needed to access a resource.
 * @param rolePermission Role permission needed to access a resource.
 * @returns Applies all decorators needed for authentication & authorization.
 */
export function AuthUser(
  roleSection?: RoleSection,
  rolePermission?: RolePermission,
) {
  const decorators = [
    ...getAuthorizationDecorators(roleSection, rolePermission),
    UseGuards(AuthGuardJwt),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  return applyDecorators(...decorators);
}
