import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AppConfig from './config/app.config';

@Injectable()
export class AppService {
  constructor(
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
  ) {}

  async getServerInfo(): Promise<string> {
    const dateTime = new Date();
    const formatedDateTime = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'long',
    }).format(dateTime);

    return `
      <html>
      <body>
        API says hello from <b>${this.appConfig.environment}</b>! <br />
        Server date & time: <b>${formatedDateTime}</b> (${dateTime.toISOString()})
      </body>
      </html>
    `;
  }
}
