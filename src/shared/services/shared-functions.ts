import { RolePermissionHelper } from 'src/auth/role/role-permission';
import { RoleSectionHelper } from 'src/auth/role/role-section';
import { RoleToSet } from 'src/modules/user/dtos/role-to-set.dto';
import { UserRoleEntity } from 'src/modules/user/entities/user-role.entity';

export class SharedFunctions {
  static getRequestIP(request: any): string | null {
    // When using nginx, request ip will be stored in 'x-forwarded-for' header.
    return request && request.headers && request.headers['x-forwarded-for']
      ? request.headers['x-forwarded-for']
      : null || request?.ip;
  }

  static stringifyRole(role: RoleToSet | UserRoleEntity) {
    if (
      typeof role.section === 'string' &&
      typeof role.permission === 'string'
    ) {
      return `${role.section}.${role.permission}`;
    }

    if (
      typeof role.section === 'number' &&
      typeof role.permission === 'number'
    ) {
      const section = RoleSectionHelper.getName(role.section);
      const permission = RolePermissionHelper.getName(role.permission);
      return `${section}.${permission}`;
    }

    throw new Error('Invalid role type');
  }
}
