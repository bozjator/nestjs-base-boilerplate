import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Put,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ReqUser } from 'src/auth/decorators/req-user.decorator';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { User } from './dtos/user.dto';
import { CacheControlHeader } from 'src/shared/decorators/cache-control-header.decorator';
import { ApiMessages } from 'src/shared/constants';
import { MessageHelper } from 'src/shared/services/message-helper';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { UserInRequest } from 'src/auth/models/user-in-request.model';
import { UserUpdate } from './dtos/user-update.dto';
import { RoleToSet } from './dtos/role-to-set.dto';
import { RoleSection } from 'src/auth/role/role-section';
import { RolePermission } from 'src/auth/role/role-permission';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get current user data.' })
  @ApiOkResponse({ type: User })
  @CacheControlHeader()
  @AuthUser()
  @Get('me')
  async getMe(@ReqUser() currentUser: UserInRequest): Promise<User> {
    const user = await this.userService.findUserById(currentUser.id);
    if (!user)
      throw new NotFoundException(
        MessageHelper.replaceParameters(ApiMessages.OBJECT_NOT_FOUND, 'User'),
      );
    return new User(user);
  }

  @ApiOperation({ summary: 'Update current user data.' })
  @ApiOkResponse({ description: ApiMessages.RETURNS_AFFECTED_OBJECTS_COUNT })
  @AuthUser()
  @Put('me')
  async updateUser(
    @Body() userUpdate: UserUpdate,
    @ReqUser() currentUser: UserInRequest,
  ): Promise<number> {
    const passwordToCheck = userUpdate.currentPassword;
    await this.authService.authUserPassword(currentUser.id, passwordToCheck);
    return await this.userService.updateUser(currentUser.id, userUpdate);
  }

  @ApiOperation({
    summary: 'Update user roles.',
    description: ApiMessages.DESCRIPTION_UPDATE_USER_ROLES,
  })
  @ApiBody({ type: [RoleToSet] })
  @ApiOkResponse({ description: 'Roles updated' })
  @ApiBadRequestResponse({ description: ApiMessages.INVALID_DATA })
  @ApiNotFoundResponse({
    description: MessageHelper.replaceParameters(
      ApiMessages.OBJECT_NOT_FOUND,
      'User',
    ),
  })
  @ApiUnprocessableEntityResponse({
    description: ApiMessages.CANNOT_HAVE_DUPLICATED_ROLE_SECTION,
  })
  @AuthUser(RoleSection.all, RolePermission.manage)
  @Put(':id/roles')
  async updateUserRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Body(new ParseArrayPipe({ items: RoleToSet })) roles: RoleToSet[],
    @ReqUser() currentUser: UserInRequest,
  ) {
    // User with role all.manage (needed to access this endpoint) cannot edit himself.
    // If we would allow this, then he could remove his all.manage role and we
    // could end up without a user that can manage all sections, including this one.
    if (userId === currentUser.id) throw new ForbiddenException();

    // Check if any role has duplicated section.
    // E.g.products.read and products.manage.
    const hasSameSection = (roleA: RoleToSet, roleB: RoleToSet) =>
      roleA.section === roleB.section;
    const rolesHasDuplicates = roles.some((roleA, indexA) =>
      roles.some(
        (roleB, indexB) => indexA !== indexB && hasSameSection(roleA, roleB),
      ),
    );
    if (rolesHasDuplicates)
      throw new UnprocessableEntityException(
        ApiMessages.CANNOT_HAVE_DUPLICATED_ROLE_SECTION,
      );

    await this.userService.updateUserRoles(userId, roles);
    await this.authService.deleteAllUserJtis(userId);
  }
}
