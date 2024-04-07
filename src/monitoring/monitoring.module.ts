import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { LoggerEntity } from 'src/logger/entities/logger.entity';

@Module({
  imports: [SequelizeModule.forFeature([LoggerEntity])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
