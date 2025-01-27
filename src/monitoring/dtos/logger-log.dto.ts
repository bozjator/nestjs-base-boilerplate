import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoggerEntity } from 'src/logger/entities/logger.entity';

class LoggerLogReponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'string[]' }],
    example: `Single string e.g. 'Error info' OR array of strings e.g. ['Error info 1', 'Error info 2']`,
  })
  message: string | string[];

  @ApiPropertyOptional()
  error?: string;
}

class LoggerLogRequest {
  @ApiProperty()
  ip: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  headers: object;

  @ApiPropertyOptional({
    oneOf: [{ type: 'object' }, { type: 'object[]' }, { type: 'unknown' }],
    example: `Object e.g. {} OR array of objects e.g. [{}].`,
  })
  body?: object | object[] | unknown;
}

export class LoggerLog {
  @ApiProperty()
  level: string;

  @ApiProperty()
  context: string;

  @ApiProperty()
  info: string;

  @ApiPropertyOptional()
  errorStack?: string;

  @ApiPropertyOptional()
  queueJobData?: string;

  @ApiPropertyOptional()
  responseStatusCode?: number;

  @ApiPropertyOptional()
  response?: LoggerLogReponse;

  @ApiPropertyOptional()
  requestIp?: string;

  @ApiPropertyOptional()
  requestMethod?: string;

  @ApiPropertyOptional()
  requestUrl?: string;

  @ApiPropertyOptional()
  requestOrigin?: string;

  @ApiPropertyOptional()
  requestReferer?: string;

  @ApiPropertyOptional()
  request?: LoggerLogRequest;

  @ApiProperty()
  timestamp: string;

  constructor(loggerLog: LoggerEntity) {
    if (loggerLog == null) return;

    this.level = loggerLog.level ?? '';
    this.context = loggerLog.context ?? '';
    this.info = loggerLog.info ?? '';
    this.errorStack = loggerLog.errorStack ?? '';
    this.queueJobData = loggerLog.queueJobData ?? '';
    this.responseStatusCode = loggerLog.responseStatusCode;
    this.response = loggerLog.response ? JSON.parse(loggerLog.response) : null;
    this.requestIp = loggerLog.requestIp ?? '';
    this.requestMethod = loggerLog.requestMethod ?? '';
    this.requestUrl = loggerLog.requestUrl ?? '';
    this.requestOrigin = loggerLog.requestOrigin ?? '';
    this.requestReferer = loggerLog.requestReferer ?? '';
    this.request = loggerLog.request ? JSON.parse(loggerLog.request) : null;
    this.timestamp = loggerLog.timestamp ?? '';
  }
}
