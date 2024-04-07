import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get OK.' })
  @ApiOkResponse({ description: 'OK' })
  @Get('')
  getOK(): string {
    return 'OK';
  }

  @ApiOperation({ summary: 'API sends its regards with environment info.' })
  @ApiOkResponse({ description: 'Message with server env and date time info.' })
  @Get('info')
  async getServerInfo(@Res() reply: FastifyReply): Promise<void> {
    reply.header('Content-Type', 'text/html');
    reply.send(await this.appService.getServerInfo());
  }
}
