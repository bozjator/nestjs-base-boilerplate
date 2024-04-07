import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CatchExceptions } from './logger/catch-exceptions.filter';
import { envValidationSchema } from './config/env.validation';
import { getSequelizeOptions } from './config/database.config';
import appConfig from './config/app.config';
import businessConfig from './config/business.config';

@Module({
  imports: [
    AuthModule,
    LoggerModule,
    MonitoringModule,
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      load: [appConfig, businessConfig],
      isGlobal: true,
      cache: true,
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => getSequelizeOptions(),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CatchExceptions,
    },
  ],
})
export class AppModule {}
