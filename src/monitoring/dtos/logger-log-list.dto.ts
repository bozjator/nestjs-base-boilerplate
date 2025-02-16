import { ApiProperty } from '@nestjs/swagger';
import { LoggerLog } from './logger-log.dto';

export class LoggerLogList {
  @ApiProperty()
  totalCount: number;

  @ApiProperty({ type: [LoggerLog] })
  result: LoggerLog[];
}
