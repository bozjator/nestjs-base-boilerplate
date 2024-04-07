import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppLoggerService } from './app-logger.service';
import { LoggerDatabaseTransport } from './logger-database-transport';
import { LoggerEntity } from './entities/logger.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([LoggerEntity])],
  exports: [AppLoggerService],
  providers: [AppLoggerService, LoggerDatabaseTransport],
})
export class LoggerModule {}
