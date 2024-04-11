import {
  Table,
  Column,
  Model,
  AllowNull,
  HasMany,
  Unique,
  DataType,
} from 'sequelize-typescript';
import { UserRoleEntity } from './user-role.entity';

// Define type that maps entity attributes.
type UserEntityKeys = keyof UserEntity;
export type UserEntityProperties = {
  [K in UserEntityKeys]?: UserEntity[K] | null;
};

export const LENGTH_USER = {
  firstName: 50,
  lastName: 50,
  email: 100,
  password: 60,
};

const columnFirstName: keyof UserEntity = 'firstName';
const columnLastName: keyof UserEntity = 'lastName';
const columnEmail: keyof UserEntity = 'email';
const columnPassword: keyof UserEntity = 'password';
export const USER_COLUMN = {
  firstName: columnFirstName,
  lastName: columnLastName,
  email: columnEmail,
  password: columnPassword,
};

@Table({ tableName: 'user' })
export class UserEntity extends Model {
  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER.firstName))
  firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER.lastName))
  lastName: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER.email))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER.password))
  password: string;

  @HasMany(() => UserRoleEntity)
  roles: UserRoleEntity[];
}
