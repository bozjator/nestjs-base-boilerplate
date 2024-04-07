import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigType } from '@nestjs/config';
import * as fs from 'fs/promises';
import { LoggerEntity } from 'src/logger/entities/logger.entity';
import { MonitoringGeneral } from './dtos/monitoring-general.dto';
import { MonitoringLogs } from './dtos/monitoring-logs.dto';
import { LoggerLog } from './dtos/logger-log.dto';
import { LoggerDBTransportErrorLog } from './dtos/logger-db-transport-error-log.dto';
import AppConfig from '../config/app.config';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectModel(LoggerEntity)
    private readonly loggerEntity: typeof LoggerEntity,
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
  ) {}

  private async getLoggerDBTransportErrorLogs(): Promise<
    LoggerDBTransportErrorLog[]
  > {
    let logsString: string = '';
    try {
      const logFilePath = this.appConfig.logger_db_transport_error_path;
      await fs.access(logFilePath);
      logsString = await fs.readFile(logFilePath, 'utf-8');
    } catch (error) {
      return [
        {
          info:
            'Error reading logger database transport error file. ' +
            'You must create it, so that errors can be appended into the file.',
          errorMessage: error.message,
          errorStack: error.stack,
        } as any,
      ];
    }

    try {
      const logsArrayAsString = `[${logsString.slice(0, -1)}]`;
      const logs = JSON.parse(logsArrayAsString);
      logs.forEach((log: LoggerDBTransportErrorLog) => {
        const loggerRecord: LoggerLog = log.loggerRecord;
        if (
          loggerRecord.response &&
          typeof loggerRecord.response === 'string' &&
          (loggerRecord.response as string).length > 0
        )
          loggerRecord.response = JSON.parse(loggerRecord.response);
        if (
          loggerRecord.request &&
          typeof loggerRecord.request === 'string' &&
          (loggerRecord.request as string).length > 0
        )
          loggerRecord.request = JSON.parse(loggerRecord.request);
      });
      return logs;
    } catch (error) {
      return [
        {
          info: 'Error parsing logger database transport error file.',
          errorMessage: error.message,
          errorStack: error.stack,
          fileContent: logsString,
        } as any,
      ];
    }
  }

  async getMonitoringGeneral(): Promise<MonitoringGeneral> {
    const dbTransportErrorLogs = await this.getLoggerDBTransportErrorLogs();
    return new MonitoringGeneral(dbTransportErrorLogs);
  }

  async getMonitoringLoggerLogs(): Promise<MonitoringLogs> {
    const loggerLogs = await this.loggerEntity.findAll();
    return new MonitoringLogs(loggerLogs);
  }
}
