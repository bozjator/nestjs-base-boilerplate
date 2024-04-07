import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { MonitoringGeneral } from './dtos/monitoring-general.dto';
import { MonitoringLogs } from './dtos/monitoring-logs.dto';
import { MonitoringAuthGuard } from './decorators/monitoring-auth-guard.decorator';

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
  @ApiOkResponse({ type: MonitoringLogs })
  @Get('logs')
  async getMonitoringLoggerLogs(): Promise<MonitoringLogs> {
    return await this.monitoringService.getMonitoringLoggerLogs();
  }
}
