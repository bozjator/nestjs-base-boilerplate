import { ApiProperty } from '@nestjs/swagger';
import { LoggerDBTransportErrorLog } from './logger-db-transport-error-log.dto';

export class MonitoringGeneral {
  @ApiProperty({ type: [LoggerDBTransportErrorLog] })
  loggerDBTransportErrorLogs: LoggerDBTransportErrorLog[];

  constructor(loggerDBTransportErrorLogs: LoggerDBTransportErrorLog[]) {
    this.loggerDBTransportErrorLogs = loggerDBTransportErrorLogs;
  }
}
