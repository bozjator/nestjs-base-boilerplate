import { ApiProperty } from '@nestjs/swagger';

export class LoggerLogListFilters {
  @ApiProperty({ type: [String] })
  level: string[];

  @ApiProperty({ type: [String] })
  context: string[];

  @ApiProperty({ type: [String] })
  requestUrl: string[];

  @ApiProperty({ type: [String] })
  requestIp: string[];

  @ApiProperty({ type: [Number] })
  responseStatusCode: number[];

  @ApiProperty({ type: [String] })
  requestMethod: string[];

  @ApiProperty({ type: [String] })
  requestOrigin: string[];

  @ApiProperty({ type: [String] })
  requestReferer: string[];
}
