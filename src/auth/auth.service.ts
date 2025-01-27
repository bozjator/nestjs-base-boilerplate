import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Op } from 'sequelize';
import ms, { StringValue } from 'ms';
import * as bcrypt from 'bcryptjs';
import {
  LENGTH_USER_JTI,
  USER_JTI_COLUMN,
  UserJtiEntity,
  UserJtiEntityProperties,
} from './entities/user-jti.entity';
import { UserEnvironment } from './other/user-environment';
import { UserService } from 'src/modules/user/user.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { User } from 'src/modules/user/dtos/user.dto';
import { LoginSuccess } from './dtos/login-success.dto';
import { AccessTokenPayload } from './dtos/access-token-payload.dto';
import { AuthMessages } from './other/auth-constants';
import { RoleUtils } from './role/role-utils';
import { Roles } from './dtos/roles.dto';
import { RoleSection } from './role/role-section';
import { RolePermission } from './role/role-permission';
import AppConfig from '../config/app.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(UserJtiEntity) private userJtiEntity: typeof UserJtiEntity,
    @Inject(AppConfig.KEY) private appConfig: ConfigType<typeof AppConfig>,
  ) {}

  /**
   * Creates new jti and stores it together with user id and his environment.
   *
   * @param userId User id for which new jti is created.
   * @param userEnv User environment.
   * @param requestIp Login request IP.
   * @returns New jti that was stored for the user.
   */
  private async storeJti(
    userId: number,
    userEnv: UserEnvironment,
    requestIp: string,
  ): Promise<string> {
    const platform = userEnv.platform.substring(0, LENGTH_USER_JTI.platform);
    const browser = userEnv.browser.substring(0, LENGTH_USER_JTI.browser);
    const reqIp = requestIp.substring(0, LENGTH_USER_JTI.requestIp);
    const newJti: UserJtiEntityProperties = {
      [USER_JTI_COLUMN.userId]: userId,
      [USER_JTI_COLUMN.platform]: platform,
      [USER_JTI_COLUMN.browser]: browser,
      [USER_JTI_COLUMN.requestIp]: reqIp,
    };
    const createdJti = await this.userJtiEntity.create(newJti);
    return createdJti.jti;
  }

  /**
   * Deletes user jti aka log out.
   *
   * @param jti User access token jti.
   * @returns True if deleted, false otherwise.
   */
  async deleteJti(jti: string): Promise<boolean> {
    const destroyedCount = await this.userJtiEntity.destroy({
      where: { jti },
    });
    return destroyedCount > 0;
  }

  /**
   * Deletes all user JTIs aka log out from all sessions.
   *
   * @param userId User id for which all JTIs will be deleted.
   * @returns True if at least one was deleted, false otherwise.
   */
  async deleteAllUserJtis(userId: number): Promise<boolean> {
    const destroyedCount = await this.userJtiEntity.destroy({
      where: { userId },
    });
    return destroyedCount > 0;
  }

  /**
   * Checks and deletes user expired jtis.
   *
   * NOTE that jwt_expires_in value from the app config is used. That means
   * that if the value gets changed, then jti can be removed sooner (before jti
   * is actually expired) or later.
   * If jwt_expires_in was reduced (e.g. from 7d to 5d) then on the next login
   * jti could be deleted before it actually expires, but since user is making
   * new login (on different browser) it is not really a problem (he will just
   * be logged out sonner as expected on the other browser, but jtw_expires_in
   * is also not intended be to change).
   *
   * @param userId User id for which expired jtis should be deleted.
   */
  async deleteExpiredJtis(userId: number): Promise<void> {
    const jwtExpiresInMs = ms(this.appConfig.jwt_expires_in as StringValue);
    const currentDateAsMs = Date.now();
    const createdBeforeDateAsMs = currentDateAsMs - jwtExpiresInMs;
    // If jti was created before this date, it should be deleted.
    const createdBeforeDate = new Date(createdBeforeDateAsMs);
    this.userJtiEntity.destroy({
      where: {
        userId,
        createdAt: { [Op.lt]: createdBeforeDate },
      },
    });
  }

  /**
   * Creates JWT token for given user and stores JTI.
   *
   * @param user User for which JWT token is created.
   * @param userEnv User environment stored together with JTI.
   * @param requestIp Login request IP.
   * @returns JWT token.
   */
  async login(
    user: UserEntity,
    userEnv: UserEnvironment,
    requestIp: string,
  ): Promise<LoginSuccess> {
    const jti = await this.storeJti(user.id, userEnv, requestIp);
    const payload: AccessTokenPayload = {
      sub: user.id,
      jti,
      given_name: user.firstName,
      roles: user.roles.map((role) => RoleUtils.stringifyRole(role)),
    };
    const token = this.jwtService.sign(payload);
    return { accessToken: token, user: new User(user) };
  }

  /**
   * Checks if user with given credentials exists and that are valid.
   *
   * It can be used in two ways, by passing email or user id.
   *
   * @param password User password credential for login.
   * @param email User email credential for login.
   * @param userId User id for which to check password.
   * @returns User object if it is found and credentials are valid, null otherwise.
   */
  async validateUser(
    password: string,
    { email, userId }: { email?: string; userId?: number },
  ): Promise<UserEntity | null> {
    if (!email && !userId) return null;

    const user: UserEntity = email
      ? await this.userService.findUserByEmail(email)
      : await this.userService.findUserById(userId);

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        delete user.password;
        return user;
      }
    }

    return null;
  }

  /**
   * Checks if given password is valid for given user id.
   * If it is not it will throw UnauthorizedException.
   *
   * @param userId User for which password needs to be checked.
   * @param password Password to check.
   */
  async authUserPassword(userId: number, password: string) {
    const userValid = !!(await this.validateUser(password, { userId }));
    if (!userValid)
      throw new UnauthorizedException(AuthMessages.PASSWORD_NOT_VALID);
  }

  /**
   * Checks if given password is valid for given user id.
   *
   * @param userId User for which password needs to be checked.
   * @param password Password to check.
   * @returns True if password is valid, false otherwise.
   */
  async checkUserPassword(userId: number, password: string) {
    const userValid = !!(await this.validateUser(password, { userId }));
    return userValid;
  }

  /**
   * Get all possible roles.
   *
   * @returns Object with list of roles (sections and permissions).
   */
  getRolesList(): Roles {
    return {
      sections: Object.values(RoleSection),
      permissions: Object.values(RolePermission),
    };
  }
}
