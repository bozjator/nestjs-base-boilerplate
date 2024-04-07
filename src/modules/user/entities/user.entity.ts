import {
  Table,
  Column,
  Model,
  AllowNull,
  HasMany,
  Unique,
} from 'sequelize-typescript';
import { UserRoleEntity } from './user-role.entity';

// Define type that maps entity attributes.
type UserEntityKeys = keyof UserEntity;
export type UserEntityProperties = {
  [K in UserEntityKeys]?: UserEntity[K] | null;
};

const columnEmail: keyof UserEntity = 'email';
const columnPassword: keyof UserEntity = 'password';
export const UserColumn = {
  email: columnEmail,
  password: columnPassword,
};

@Table({ tableName: 'user' })
export class UserEntity extends Model {
  @AllowNull(false)
  @Column
  firstName: string;

  @AllowNull(false)
  @Column
  lastName: string;

  @Unique
  @AllowNull(false)
  @Column
  email: string;

  @AllowNull(false)
  @Column
  password: string;

  @HasMany(() => UserRoleEntity)
  roles: UserRoleEntity[];
}
