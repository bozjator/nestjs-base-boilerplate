import { ApiProperty } from '@nestjs/swagger';
import { LoggerEntity } from 'src/logger/entities/logger.entity';
import { LoggerLog } from './logger-log.dto';

export class MonitoringLogs {
  @ApiProperty({ type: [LoggerLog] })
  logs: LoggerLog[];

  constructor(loggerLogs: LoggerEntity[]) {
    this.logs = loggerLogs.map((ll) => new LoggerLog(ll));
  }
}
