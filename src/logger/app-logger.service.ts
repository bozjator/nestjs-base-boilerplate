import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as winston from 'winston';
import AppConfig from '../config/app.config';
import { LoggerDatabaseTransport } from './logger-database-transport';
import { LoggerInfoObject } from './models/logger-info-object.model';
import { Environment } from 'src/config/environment.enum';
import { MONITORING_SECRET_HEADER_NAME } from 'src/monitoring/decorators/monitoring-auth-guard.decorator';
import { LoggerLevel } from './models/logger-level.enum';

/**
 * Logger for printing log messages into a console and storing them into the
 * database. Messages are printed into a console only in development environment.
 */
@Injectable()
export class AppLoggerService {
  /**
   * When exception is logged, request object is stored together with the exception.
   * The following properties will be removed from the request object.
   */
  private sensitiveRequestProperties = [
    'secret',
    'password',
    'oldPassword',
    'newPassword',
    'currentPassword',
  ];

  /**
   * When exception is logged, request object is stored together with the exception.
   * The following headers will be removed from the request object.
   */
  private sensitiveRequestHeaders = [
    'authorization',
    '!~passenger-envvars',
    MONITORING_SECRET_HEADER_NAME,
  ];

  private logger: winston.Logger;
  private isEnvDevelopment: boolean;

  constructor(
    private readonly databaseTransport: LoggerDatabaseTransport,
    @Inject(AppConfig.KEY) private config: ConfigType<typeof AppConfig>,
  ) {
    this.isEnvDevelopment = this.config.environment === Environment.development;
    const { format, transports } = winston;
    this.logger = winston.createLogger({
      format: format.combine(
        format.timestamp({ format: () => new Date().toISOString() }),
        format.json(),
      ),
      transports: this.prepareWinstonTransports(format, transports),
    });
  }

  private color = {
    red: (value: string) => `\x1b[31m${value}\x1b[0m`,
    green: (value: string) => `\x1b[32m${value}\x1b[0m`,
    yellow: (value: string) => `\x1b[33m${value}\x1b[0m`,
    blue: (value: string) => `\x1b[34m${value}\x1b[0m`,
  };

  private getFormattedConsoleLog(data: winston.Logform.TransformableInfo) {
    const dateTime = new Date(data.timestamp as string);
    const timestamp = new Intl.DateTimeFormat('sl', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(dateTime);

    const messageData: LoggerInfoObject = data.message as any;
    const context = this.color.yellow(`[${messageData.context}]`);

    const errorStack = messageData.errorStack
      ? '\n' + messageData.errorStack
      : '';
    const info = messageData.info + ' ' + errorStack;
    const loggerName = '[AppLogger]';
    let infoColored: string;
    let loggerNameColored: string;

    if (data.level.indexOf(LoggerLevel.error) !== -1) {
      infoColored = this.color.red(info);
      loggerNameColored = this.color.red(loggerName);
    } else if (data.level.indexOf(LoggerLevel.info) !== -1) {
      infoColored = this.color.green(info);
      loggerNameColored = this.color.green(loggerName);
    } else {
      infoColored = this.color.blue(info);
      loggerNameColored = this.color.blue(loggerName);
    }

    return `${loggerNameColored} \t ${timestamp} \t ${data.level} \t ${context} ${infoColored}`;
  }

  private prepareWinstonTransports(
    format: typeof winston.format,
    transports: winston.transports.Transports,
  ) {
    const loggerTransports: any = [];

    // Add console logging in development environment.
    if (this.isEnvDevelopment) {
      const consoleLogFormat = format.printf((data) =>
        this.getFormattedConsoleLog(data),
      );
      loggerTransports.push(
        new transports.Console({
          format: format.combine(format.colorize(), consoleLogFormat),
          level: 'debug',
        }),
      );
    }

    loggerTransports.push(this.databaseTransport);
    return loggerTransports;
  }

  /**
   * Removes any password or other sensitive data from request body.
   *
   * @param infoObject Object with request body object.
   */
  private removeSensitiveDataFromRequest(infoObject: LoggerInfoObject) {
    const checkRequestBody = (object: any) => {
      if (Array.isArray(object))
        object.forEach((item: any) => checkRequestBody(item));
      else if (typeof object === 'object' && object !== null)
        for (const key in object)
          if (Object.prototype.hasOwnProperty.call(object, key))
            this.sensitiveRequestProperties.includes(key)
              ? (object[key] = 'REMOVED_BY_LOGGER')
              : checkRequestBody(object[key]);
    };

    if (infoObject && infoObject.request && infoObject.request.body)
      checkRequestBody(infoObject.request.body);

    if (infoObject && infoObject.request && infoObject.request.headers)
      for (const name of this.sensitiveRequestHeaders)
        delete infoObject.request.headers[name];
  }

  /**
   * Use 'debug' method to log message only into a console.
   * In production environment this method does nothing.
   *
   * @param infoObject Info object to log.
   */
  debug(infoObject: LoggerInfoObject): void;
  debug(context: string, message: string): void;
  debug(arg1: string | LoggerInfoObject, message?: string): void {
    if (!this.isEnvDevelopment) return;

    if (typeof arg1 !== 'string') {
      this.logger.debug(arg1);
    } else {
      const infoObject: LoggerInfoObject = {
        context: arg1,
        info: message,
      };
      this.logger.debug(infoObject);
    }
  }

  /**
   * Use 'info' method to persistently store info message.
   * In development environment will also print it into a console.
   *
   * @param infoObject Info object to log.
   */
  info(infoObject: LoggerInfoObject): void;
  info(context: string, message: string): void;
  info(arg1: string | LoggerInfoObject, message?: string): void {
    const infoObject: LoggerInfoObject =
      typeof arg1 !== 'string'
        ? arg1
        : new LoggerInfoObject({
            context: arg1,
            info: message,
          });

    this.removeSensitiveDataFromRequest(infoObject);
    this.logger.info(infoObject);
  }

  /**
   * Use 'error' method to persistently store error message.
   * In development environment will also print it into a console.
   *
   * @param infoObject Info object to log.
   */
  error(infoObject: LoggerInfoObject) {
    this.removeSensitiveDataFromRequest(infoObject);
    this.logger.error(infoObject);
  }
}
