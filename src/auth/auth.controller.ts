import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Res,
  Put,
  HttpCode,
  Get,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuthMessages } from './other/auth-constants';
import { ApiMessages } from 'src/shared/constants';
import { AuthService } from './auth.service';
import { UserService } from 'src/modules/user/user.service';
import { ChangePassword } from './dtos/change-password.dto';
import { CurrentPassword } from './dtos/current-password.dto';
import { LoginSuccess } from './dtos/login-success.dto';
import { UserLogin } from './dtos/user-login.dto';
import { UserRegistration } from './dtos/user-registration.dto';
import { Roles } from './dtos/roles.dto';
import { ReqUser } from './decorators/req-user.decorator';
import { CacheControlHeader } from 'src/shared/decorators/cache-control-header.decorator';
import { AuthUser } from './decorators/auth-user.decorator';
import { RoleSection } from './role/role-section';
import { RolePermission } from './role/role-permission';
import { AuthGuardLocal } from './guards/auth-local.guard';
import { SharedFunctions } from 'src/shared/services/shared-functions';
import { getUserEnvironment } from './other/user-environment';
import { UserInRequest } from './models/user-in-request.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get JWT access token.' })
  @ApiBody({ type: UserLogin })
  @ApiCreatedResponse({
    description: AuthMessages.AUTH_SUCCESSFUL,
    type: LoginSuccess,
  })
  @ApiNotFoundResponse({ description: AuthMessages.AUTH_FAILD })
  @UseGuards(AuthGuardLocal)
  @Post('login')
  async login(@Req() req: any): Promise<LoginSuccess> {
    // User was added into the request by auth guard for local strategy.
    const user: UserEntity = req.user;
    const requestIp = SharedFunctions.getRequestIP(req);
    const ua = req.headers['user-agent'];
    const userEnv = getUserEnvironment(ua);
    await this.authService.deleteExpiredJtis(user.id);
    return await this.authService.login(user, userEnv, requestIp);
  }

  @ApiOperation({ summary: 'Log out the current user.' })
  @ApiResponse({
    status: HttpStatus.RESET_CONTENT,
    description: AuthMessages.LOGOUT_SUCCESSFUL,
  })
  @AuthUser()
  @Post('logout')
  async logout(@Res() res: any, @ReqUser() user: UserInRequest) {
    await this.authService.deleteJti(user.jti);
    return res.status(HttpStatus.RESET_CONTENT).send();
  }

  @ApiOperation({ summary: 'Log out the current user from all his sessions.' })
  @ApiResponse({
    status: HttpStatus.RESET_CONTENT,
    description: AuthMessages.LOGOUT_SUCCESSFUL,
  })
  @AuthUser()
  @Post('logout-everywhere')
  async logoutEverywhere(@Res() res: any, @ReqUser() user: UserInRequest) {
    await this.authService.deleteAllUserJtis(user.id);
    return res.status(HttpStatus.RESET_CONTENT).send();
  }

  @ApiOperation({ summary: 'Register new user.' })
  @ApiCreatedResponse({ description: ApiMessages.RETURNS_CREATED_RECORD_ID })
  @ApiBadRequestResponse({ description: ApiMessages.INVALID_DATA })
  @ApiConflictResponse({ description: AuthMessages.USER_EXISTS })
  @Post('register')
  async register(@Body() userReg: UserRegistration): Promise<number> {
    return await this.userService.createUser(userReg);
  }

  @ApiOperation({ summary: 'Check password for the current user.' })
  @ApiOkResponse({ description: AuthMessages.PASSWORD_CHECK })
  @HttpCode(200)
  @AuthUser()
  @Post('check-password')
  async checkPassword(
    @Body() password: CurrentPassword,
    @ReqUser() user: UserInRequest,
  ): Promise<boolean> {
    const passwordToCheck = password.currentPassword;
    return await this.authService.checkUserPassword(user.id, passwordToCheck);
  }

  @ApiOperation({
    summary: 'Change password for the current user.',
    description: AuthMessages.DESCRIPTION_CHANGE_PASSWORD,
  })
  @ApiOkResponse({ description: ApiMessages.RETURNS_AFFECTED_OBJECTS_COUNT })
  @AuthUser()
  @Put('change-password')
  async changePassword(
    @Body() password: ChangePassword,
    @ReqUser() user: UserInRequest,
  ): Promise<number> {
    const passwordToCheck = password.currentPassword;
    await this.authService.authUserPassword(user.id, passwordToCheck);
    const affectedCount = await this.userService.changeUserPassword(
      user.id,
      password.newPassword,
    );
    await this.authService.deleteAllUserJtis(user.id);
    return affectedCount;
  }

  @ApiOperation({
    summary: 'Get list of possible roles.',
    description: AuthMessages.DESCRIPTION_ROLES_LIST,
  })
  @ApiOkResponse({ type: Roles })
  @CacheControlHeader()
  @AuthUser(RoleSection.all, RolePermission.read)
  @Get('role/list')
  async getRolesList() {
    return this.authService.getRolesList();
  }
}
