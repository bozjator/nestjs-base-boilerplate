import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AppConfig from 'src/config/app.config';
import { AccessTokenPayload } from '../dtos/access-token-payload.dto';
import { UserInRequest } from '../models/user-in-request.model';

export const authStrategyJwtName = 'auth-strategy-jwt';

/**
 * Passport JWT strategy for executing user access token validation.
 */
@Injectable()
export class AuthStrategyJwt extends PassportStrategy(
  Strategy,
  authStrategyJwtName,
) {
  constructor(@Inject(AppConfig.KEY) config: ConfigType<typeof AppConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt_secret_key,
    });
  }

  /**
   * After the access token is validated by the passport token validation,
   * this method is called.
   * It will take user id from token payload and create user object
   * for the request and add it to the request.
   *
   * NOTE: after this method, next token validation will be done, see the
   * jwt auth guard canActivate method.
   *
   * @param payload Payload from the access token.
   * @returns User object that will be added to the current request.
   */
  async validate(payload: AccessTokenPayload): Promise<UserInRequest> {
    return { id: payload.sub, roles: payload.roles, jti: payload.jti };
  }
}
