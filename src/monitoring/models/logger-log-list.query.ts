import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationQuery } from 'src/shared/models/pagination.query';
import { ApiPropertyEnum } from 'src/shared/decorators/api-property-enum.decorator';
import {
  ENUM_NAME_LOGGER_LEVEL,
  LoggerLevel,
} from 'src/logger/models/logger-level.enum';
/**
 * Column names from the entity, available for sorting the records.
 */
enum LoggerLogSortColumn {
  level = 'level',
  context = 'context',
  responseStatusCode = 'responseStatusCode',
  requestIp = 'requestIp',
  requestMethod = 'requestMethod',
  requestUrl = 'requestUrl',
  requestOrigin = 'requestOrigin',
  requestReferer = 'requestReferer',
  createdAt = 'createdAt',
}

export class LoggerLogListQuery extends PaginationQuery {
  @ApiPropertyEnum(LoggerLogSortColumn, 'sortColumn')
  sortColumn: LoggerLogSortColumn;

  @ApiPropertyEnum(LoggerLevel, 'level', {
    isOptional: true,
    enumName: ENUM_NAME_LOGGER_LEVEL,
  })
  level?: string;

  @IsOptional()
  @ApiPropertyOptional()
  context?: string;

  @IsOptional()
  @ApiPropertyOptional()
  responseStatusCode?: number;

  @IsOptional()
  @ApiPropertyOptional()
  requestIp?: string;

  @IsOptional()
  @ApiPropertyOptional()
  requestMethod?: string;

  @IsOptional()
  @ApiPropertyOptional()
  requestUrl?: string;

  @IsOptional()
  @ApiPropertyOptional()
  requestOrigin?: string;

  @IsOptional()
  @ApiPropertyOptional()
  requestReferer?: string;
}
