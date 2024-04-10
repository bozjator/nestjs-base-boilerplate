import { RoleToSet } from 'src/modules/user/dtos/role-to-set.dto';
import { UserRoleEntity } from 'src/modules/user/entities/user-role.entity';
import { RoleSectionHelper } from './role-section';
import { RolePermissionHelper } from './role-permission';

export class RoleUtils {
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
