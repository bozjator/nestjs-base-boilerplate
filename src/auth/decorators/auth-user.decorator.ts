import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleSection } from '../models/role-section.enum';
import { RolePermission } from '../models/role-permission.enum';
import { AuthGuardJwt } from '../guards/auth-jwt.guard';

export const ROLE_SECTION_KEY = 'role_section';
export const ROLE_PERMISSION_KEY = 'role_permission';

/**
 * Creates list of decorators for authorization for given role.
 *
 * NOTE: do not use it directly, it is only intended for use by AuthUser and
 * AuthUserChanage, because it will not apply decorators for triggering
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
    SetMetadata(ROLE_SECTION_KEY, roleSection),
    SetMetadata(ROLE_PERMISSION_KEY, rolePermission),
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
 * and authorization will happen twice. Instead use the AuthUserChanage
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
