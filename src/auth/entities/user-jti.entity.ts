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
import { USER_ENV_PARAM_LENGTH } from '../other/user-environment';

// Define type that maps entity attributes.
type UserJtiEntityKeys = keyof UserJtiEntity;
export type UserJtiEntityProperties = {
  [K in UserJtiEntityKeys]?: UserJtiEntity[K] | null;
};

const LengthUserJti = {
  requestIp: 40,
};

const columnUserId: keyof UserJtiEntity = 'userId';
const columnPlatform: keyof UserJtiEntity = 'platform';
const columnBrowser: keyof UserJtiEntity = 'browser';
const columnRequestIp: keyof UserJtiEntity = 'requestIp';
export const USER_JTI_COLUMN = {
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
  @Column(DataType.STRING(USER_ENV_PARAM_LENGTH))
  platform: string;

  @AllowNull(false)
  @Column(DataType.STRING(USER_ENV_PARAM_LENGTH))
  browser: string;

  @AllowNull(false)
  @Column(DataType.STRING(LengthUserJti.requestIp))
  requestIp: string;
}
