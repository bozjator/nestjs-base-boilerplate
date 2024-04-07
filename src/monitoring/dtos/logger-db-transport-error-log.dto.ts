import { ApiProperty } from '@nestjs/swagger';
import { LoggerLog } from './logger-log.dto';

export class LoggerDBTransportErrorLog {
  @ApiProperty()
  error: object;

  @ApiProperty()
  loggerRecord: LoggerLog;
}
