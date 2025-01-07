import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  META_KEY_ROLE_PERMISSION,
  META_KEY_ROLE_SECTION,
} from '../decorators/auth-user.decorator';
import { UserInRequest } from '../models/user-in-request.model';
import { authStrategyJwtName } from '../strategies/auth-jwt.strategy';
import { getUserEnvironment } from '../other/user-environment';
import { AuthTokenValidationService } from './auth-token-validation.service';
import { RoleSection } from '../role/role-section';
import { RolePermission } from '../role/role-permission';

@Injectable()
export class AuthGuardJwt extends AuthGuard(authStrategyJwtName) {
  constructor(
    private reflector: Reflector,
    private readonly tokenValidationService: AuthTokenValidationService,
  ) {
    super();
  }

  /**
   * Checks if user is allowed (has permission) to access a resource.
   *
   * @param context Execution context.
   * @param user User whose roles needs to be verified.
   * @returns True if he is allowed to access a resource, false otherwise.
   */
  private canAccessResource(
    context: ExecutionContext,
    user: UserInRequest,
  ): boolean {
    const requiredSection = this.reflector.getAllAndOverride<RoleSection>(
      META_KEY_ROLE_SECTION,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermission = this.reflector.getAllAndOverride<RolePermission>(
      META_KEY_ROLE_PERMISSION,
      [context.getHandler(), context.getClass()],
    );

    // If section and permission are not defined, then permission is not needed.
    if (requiredSection === undefined && requiredPermission === undefined)
      return true;

    // If section or permission is not defined, reject it.
    if (requiredSection === undefined || requiredPermission === undefined)
      return false;

    // If user can manage all sections, allow access.
    const userHasRoleAllManage = user.roles.some(
      (userRole) => userRole === `${RoleSection.all}.${RolePermission.manage}`,
    );
    if (userHasRoleAllManage) return true;

    // If user can read all sections and required permission is read, allow access.
    const userHasRoleAllRead = user.roles.some(
      (userRole) => userRole === `${RoleSection.all}.${RolePermission.read}`,
    );
    if (userHasRoleAllRead && requiredPermission === RolePermission.read)
      return true;

    // Prepare which roles are required.
    const requiredRoles = [`${requiredSection}.${requiredPermission}`];
    // If requiredPermission is 'read', then also 'manage' is allowed.
    if (requiredPermission == RolePermission.read)
      requiredRoles.push(`${requiredSection}.${RolePermission.manage}`);

    const canAccess = user.roles.some((userRole) =>
      requiredRoles.includes(userRole),
    );

    return canAccess;
  }

  /**
   * First triggers passport strategy token validation,
   * then checks if user has necessary permissions to access a resource and
   * then checks if user access token jti is stored in database.
   *
   * It will also check if current request user agent platform and browser
   * matches the one that was stored when jti was created (on login).
   *
   * @param context Execution context.
   * @returns True if validataion is ok, otherwise throws unauthorized
   * or forbidden exception.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First execute validation of jwt token that is done by PassportStrategy.
    const isValid = (await super.canActivate(context)) as boolean;
    if (!isValid) {
      // This is just a precaution, execution was already terminated.
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserInRequest;

    // Check if user has permission.
    const canAccess = this.canAccessResource(context, user);
    if (!canAccess) throw new ForbiddenException();

    // Check if token jti is in database.
    const userEnv = getUserEnvironment(request.headers['user-agent']);
    const isTokenValid = await this.tokenValidationService.validateTokenJti(
      user.jti,
      userEnv,
      request,
    );
    if (!isTokenValid) throw new UnauthorizedException();

    return true;
  }

  /*
  // Called after passport strategy token validation is done (successful or not).
  // Can be usefull to see some info why passport token validation faild.
  handleRequest(err, user, info) {
    console.log('err: ', err);
    console.log('info: ', info);
    console.log('user: ', user);
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
  */
}
