import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Observable } from 'rxjs';
import AppConfig from '../../config/app.config';

export const MONITORING_SECRET_HEADER_NAME = 'x-api-monitoring-secret';

@Injectable()
export class MonitoringAuthGuard implements CanActivate {
  constructor(
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const requestSecret = request.headers[MONITORING_SECRET_HEADER_NAME];
    return requestSecret === this.appConfig.monitoring_secret;
  }
}
