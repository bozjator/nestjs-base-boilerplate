import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigType } from '@nestjs/config';
import Transport from 'winston-transport';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerEntity, LoggerEntityProperties } from './entities/logger.entity';
import { LoggerInfoObject } from './models/logger-info-object.model';
import { LoggerDBTransportErrorLog } from 'src/monitoring/dtos/logger-db-transport-error-log.dto';
import { SharedFunctions } from 'src/shared/services/shared-functions';
import AppConfig from '../config/app.config';

/**
 * Logger transport for storing logs into the database.
 * If storing a log into the database fails, it will store it into a file.
 * This file must exist in order for this transport to be able to append logs to it.
 */
@Injectable()
export class LoggerDatabaseTransport extends Transport {
  constructor(
    @InjectModel(LoggerEntity)
    private readonly loggerEntity: typeof LoggerEntity,
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
  ) {
    super();
  }

  private logDBTransportError(
    error: any,
    loggerRecord: LoggerEntityProperties,
  ) {
    const errorLog: LoggerDBTransportErrorLog | any = { error, loggerRecord };
    const errorLogAsString = JSON.stringify(errorLog) + ',';
    const logFilePath = this.appConfig.logger_db_transport_error_path;

    try {
      // Ensure path directory existence.
      const directoryPath = path.dirname(logFilePath);
      fs.mkdirSync(directoryPath, { recursive: true });

      // Log error into the file.
      fs.appendFile(logFilePath, errorLogAsString, () => {});
    } catch (_) {}
  }

  log(info: any, callback: any) {
    setImmediate(() => this.emit('logged', info));

    const getSubstring255 = (v: string | null) => v && v.substring(0, 255);

    const level: string = info.level;
    const timestamp: string = info.timestamp;
    const logInfo: LoggerInfoObject = info.message;

    const requestIp = SharedFunctions.getRequestIP(logInfo.request);
    const requestHeaders: any | null = logInfo.request?.headers;

    const logRecord: LoggerEntityProperties = {
      level,
      context: logInfo.context,
      info: logInfo.info,
      errorStack: logInfo.errorStack,
      queueJobData: logInfo.queueJobData?.toString(),
      responseStatusCode: logInfo.response?.statusCode,
      response: logInfo.response ? JSON.stringify(logInfo.response) : null,
      requestIp,
      requestMethod: logInfo.request?.method,
      requestUrl: getSubstring255(logInfo.request?.url),
      requestOrigin: getSubstring255(requestHeaders?.origin),
      requestReferer: getSubstring255(requestHeaders?.referer),
      request: logInfo.request ? JSON.stringify(logInfo.request) : null,
      timestamp: getSubstring255(timestamp),
    };

    this.loggerEntity
      .create(logRecord)
      .then(() => callback())
      .catch((error) => {
        this.logDBTransportError(error, logRecord);
        callback(); // Do not send error as parameter, it will kill the process.
      });
  }
}
