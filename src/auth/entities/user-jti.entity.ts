import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  PrimaryKey,
  DataType,
  Default,
} from 'sequelize-typescript';
import { UserEntity } from 'src/modules/user/entities/user.entity';

// Define type that maps entity attributes.
type UserJtiEntityKeys = keyof UserJtiEntity;
export type UserJtiEntityProperties = {
  [K in UserJtiEntityKeys]?: UserJtiEntity[K] | null;
};

export const LENGTH_USER_JTI = {
  platform: 20,
  browser: 20,
  requestIp: 40,
};

const columnJti: keyof UserJtiEntity = 'jti';
const columnUserId: keyof UserJtiEntity = 'userId';
const columnPlatform: keyof UserJtiEntity = 'platform';
const columnBrowser: keyof UserJtiEntity = 'browser';
const columnRequestIp: keyof UserJtiEntity = 'requestIp';
export const USER_JTI_COLUMN = {
  jti: columnJti,
  userId: columnUserId,
  platform: columnPlatform,
  browser: columnBrowser,
  requestIp: columnRequestIp,
};

@Table({ tableName: 'user_jti' })
export class UserJtiEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  jti: string;

  @ForeignKey(() => UserEntity)
  @AllowNull(false)
  @Column
  userId: number;

  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER_JTI.platform))
  platform: string;

  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER_JTI.browser))
  browser: string;

  @AllowNull(false)
  @Column(DataType.STRING(LENGTH_USER_JTI.requestIp))
  requestIp: string;
}
