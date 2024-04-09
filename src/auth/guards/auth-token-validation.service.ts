import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FastifyRequest } from 'fastify';
import { UserEnvironment } from '../other/user-environment';
import { AppLoggerService } from 'src/logger/app-logger.service';
import { LoggerInfoObject } from 'src/logger/models/logger-info-object.model';
import { USER_JTI_COLUMN, UserJtiEntity } from '../entities/user-jti.entity';

@Injectable()
export class AuthTokenValidationService {
  constructor(
    private readonly logger: AppLoggerService,
    @InjectModel(UserJtiEntity) private userJtiEntity: typeof UserJtiEntity,
  ) {}

  /**
   * Checks if JTI for given user environment exists.
   *
   * If JTI is found, but platform or browser does not match, JTI will be deleted.
   *
   * @param jti Token identifier to check if it exists.
   * @param userEnv User environment.
   * @param request Http request.
   * @returns True if exists, false otherwise.
   */
  async validateTokenJti(
    jti: string,
    userEnv: UserEnvironment,
    request: FastifyRequest,
  ): Promise<boolean> {
    const jtiRecord = await this.userJtiEntity.findOne({
      attributes: [
        USER_JTI_COLUMN.userId,
        USER_JTI_COLUMN.platform,
        USER_JTI_COLUMN.browser,
      ],
      where: { [USER_JTI_COLUMN.jti]: jti },
    });

    if (jtiRecord) {
      const jtiValid =
        jtiRecord.platform === userEnv.platform &&
        jtiRecord.browser === userEnv.browser;

      if (jtiValid) return true;

      // Delete JTI because we found it, but the platform or browser was not matched.
      await this.userJtiEntity.destroy({ where: { jti } });

      // Log the incident.
      this.logger.info(
        new LoggerInfoObject({
          context: AuthTokenValidationService.name,
          info:
            `Deleted JTI because it was found in database, but the request ` +
            `platform or browser did not match the stored values in database. ` +
            `User id ${jtiRecord.userId}.`,
          request: {
            ip: request.ip,
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
          },
        }),
      );
    }

    return false;
  }
}
