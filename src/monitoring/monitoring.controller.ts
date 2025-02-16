import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { MonitoringGeneral } from './dtos/monitoring-general.dto';
import { MonitoringAuthGuard } from './decorators/monitoring-auth-guard.decorator';
import { LoggerLogListQuery } from './models/logger-log-list.query';
import { LoggerLogList } from './dtos/logger-log-list.dto';
import { LoggerLogListFilters } from './dtos/logger-log-list-filters.dto';

@UseGuards(MonitoringAuthGuard)
@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @ApiOperation({ summary: 'Get logs for failed logger DB transport.' })
  @ApiOkResponse({ type: MonitoringGeneral })
  @Get('general')
  async getMonitoringGeneral(): Promise<MonitoringGeneral> {
    return await this.monitoringService.getMonitoringGeneral();
  }

  @ApiOperation({ summary: 'Get logger logs.' })
  @ApiOkResponse({ type: LoggerLogList })
  @Get('logs')
  async getMonitoringLoggerLogs(
    @Query() query: LoggerLogListQuery,
  ): Promise<LoggerLogList> {
    return await this.monitoringService.getMonitoringLoggerLogs(query);
  }

  @ApiOperation({ summary: 'Get logger logs filters.' })
  @ApiOkResponse({ type: LoggerLogListFilters })
  @Get('logs-filters')
  async getMonitoringLoggerLogsFilters(): Promise<LoggerLogListFilters> {
    return await this.monitoringService.getMonitoringLoggerLogsFilters();
  }
}
