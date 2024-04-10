import { RoleHelper } from './role-helper';

export enum RolePermission {
  read = 'read',
  manage = 'manage',
}
/**
 * Maps RolePermission enum values to numeric identifiers.
 *
 * Key-value pairs represent the mapping of RolePermission enum values to their
 * corresponding numeric identifiers, needed for storing it into database as
 * numbers.
 */
const rolePermissionMap: Map<RolePermission, number> = new Map([
  [RolePermission.manage, 1],
  [RolePermission.read, 2],
]);

export class RolePermissionHelper extends RoleHelper {
  static assertCompleteMapping = (): void =>
    super.assertCompleteMapping(
      'RolePermission',
      Object.values(RolePermission),
      rolePermissionMap,
    );

  static getNumber = (enumValue: RolePermission | string): number =>
    super.enumToNumber(enumValue, rolePermissionMap);

  static getName = (permissionNumber: number): RolePermission | null =>
    super.numberToEnum(permissionNumber, rolePermissionMap);
}
RolePermissionHelper.assertCompleteMapping();
