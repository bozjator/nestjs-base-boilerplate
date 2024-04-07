import { RoleToAdd } from 'src/modules/user/dtos/role-to-add.dto';
import { UserRoleEntity } from 'src/modules/user/entities/user-role.entity';

export class SharedFunctions {
  static getRequestIP(request: any): string | null {
    // When using nginx, request ip will be stored in 'x-forwarded-for' header.
    return request && request.headers && request.headers['x-forwarded-for']
      ? request.headers['x-forwarded-for']
      : null || request?.ip;
  }

  static roleToString(role: RoleToAdd | UserRoleEntity) {
    return `${role.section}.${role.permission}`;
  }
}
