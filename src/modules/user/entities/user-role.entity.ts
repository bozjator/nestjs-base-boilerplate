import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { UserEntity } from './user.entity';

// Define type that maps entity attributes.
type UserRoleEntityKeys = keyof UserRoleEntity;
export type UserRoleEntityProperties = {
  [K in UserRoleEntityKeys]?: UserRoleEntity[K] | null;
};

const columnUserId: keyof UserRoleEntity = 'userId';
const columnSection: keyof UserRoleEntity = 'section';
const columnPermission: keyof UserRoleEntity = 'permission';
export const USER_ROLE_COLUMN = {
  userId: columnUserId,
  section: columnSection,
  permission: columnPermission,
};

@Table({
  tableName: 'user_role',
})
export class UserRoleEntity extends Model {
  @ForeignKey(() => UserEntity)
  @AllowNull(false)
  @Column
  userId: number;

  @AllowNull(false)
  @Column(DataType.TINYINT.UNSIGNED)
  section: number;

  @AllowNull(false)
  @Column(DataType.TINYINT.UNSIGNED)
  permission: number;
}
