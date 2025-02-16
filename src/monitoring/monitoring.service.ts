import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ConfigType } from '@nestjs/config';
import { Op, WhereOptions } from 'sequelize';
import * as fs from 'fs/promises';
import {
  COLUMN_LOGGER,
  LoggerColumnKeys,
  LoggerEntity,
} from 'src/logger/entities/logger.entity';
import { MonitoringGeneral } from './dtos/monitoring-general.dto';
import { LoggerLog } from './dtos/logger-log.dto';
import { LoggerDBTransportErrorLog } from './dtos/logger-db-transport-error-log.dto';
import { LoggerLogListQuery } from './models/logger-log-list.query';
import { LoggerLogList } from './dtos/logger-log-list.dto';
import { LoggerLogListFilters } from './dtos/logger-log-list-filters.dto';
import AppConfig from '../config/app.config';

@Injectable()
export class MonitoringService {
  private loggerLogsFilterProperties: (keyof LoggerColumnKeys)[] = [
    'level',
    'context',
    'requestUrl',
    'requestIp',
    'responseStatusCode',
    'requestMethod',
    'requestOrigin',
    'requestReferer',
  ];

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

  async getMonitoringLoggerLogs(
    query: LoggerLogListQuery,
  ): Promise<LoggerLogList> {
    const offset = (query.pageNumber - 1) * query.pageItems;
    const limit = query.pageItems;

    const where: WhereOptions = {};
    this.loggerLogsFilterProperties.forEach((property) => {
      if (query[property]) where[COLUMN_LOGGER[property]] = query[property];
    });

    const result = await this.loggerEntity.findAndCountAll({
      where,
      offset: offset < 0 ? 0 : offset,
      limit: limit < 0 ? 0 : limit,
      order: [[query.sortColumn, query.sortOrder]],
    });

    return {
      totalCount: result.count,
      result: result.rows.map((log) => new LoggerLog(log)),
    };
  }

  async getMonitoringLoggerLogsFilters(): Promise<LoggerLogListFilters> {
    const filters: LoggerLogListFilters = {
      level: [],
      context: [],
      requestUrl: [],
      requestIp: [],
      responseStatusCode: [],
      requestMethod: [],
      requestOrigin: [],
      requestReferer: [],
    };

    for (const property of this.loggerLogsFilterProperties) {
      const results = await this.loggerEntity.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col(property)), property],
        ],
        where: { [property]: { [Op.ne]: null } },
        raw: true,
      });
      filters[property as any] = results.map((result) => result[property]);
    }

    return filters;
  }
}
