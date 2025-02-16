import {
  AllowNull,
  Column,
  DataType,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';

const LENGTH_LOGGER = {
  level: 10,
  requestIp: 40,
  requestMethod: 10,
};

// Define type that maps entity attributes.
type LoggerEntityKeys = keyof LoggerEntity;
export type LoggerEntityProperties = {
  [K in LoggerEntityKeys]?: LoggerEntity[K] | null;
};

export type LoggerColumnKeys = Pick<
  LoggerEntity,
  | 'level'
  | 'context'
  | 'responseStatusCode'
  | 'requestIp'
  | 'requestMethod'
  | 'requestUrl'
  | 'requestOrigin'
  | 'requestReferer'
>;
export const COLUMN_LOGGER: Record<keyof LoggerColumnKeys, keyof LoggerEntity> =
  {
    level: 'level',
    context: 'context',
    responseStatusCode: 'responseStatusCode',
    requestIp: 'requestIp',
    requestMethod: 'requestMethod',
    requestUrl: 'requestUrl',
    requestOrigin: 'requestOrigin',
    requestReferer: 'requestReferer',
  };

@Table({ tableName: 'logger' })
export class LoggerEntity extends Model {
  @Index
  @AllowNull
  @Column(DataType.STRING(LENGTH_LOGGER.level))
  level: string;

  @Index
  @AllowNull
  @Column
  context: string;

  @AllowNull
  @Column(DataType.TEXT)
  info: string;

  @AllowNull
  @Column(DataType.TEXT)
  errorStack: string;

  @AllowNull
  @Column(DataType.TEXT)
  queueJobData: string;

  @Index
  @AllowNull
  @Column(DataType.SMALLINT)
  responseStatusCode: number;

  @AllowNull
  @Column(DataType.TEXT)
  response: string;

  @Index
  @AllowNull
  @Column(DataType.STRING(LENGTH_LOGGER.requestIp))
  requestIp: string;

  @Index
  @AllowNull
  @Column(DataType.STRING(LENGTH_LOGGER.requestMethod))
  requestMethod: string;

  @Index
  @AllowNull
  @Column
  requestUrl: string;

  @Index
  @AllowNull
  @Column
  requestOrigin: string;

  @Index
  @AllowNull
  @Column
  requestReferer: string;

  @AllowNull
  @Column(DataType.TEXT)
  request: string;

  @AllowNull
  @Column
  timestamp: string;
}
