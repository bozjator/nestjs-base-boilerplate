import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import {
  USER_COLUMN,
  UserEntity,
  UserEntityProperties,
} from './entities/user.entity';
import {
  USER_ROLE_COLUMN,
  UserRoleEntity,
  UserRoleEntityProperties,
} from './entities/user-role.entity';
import { UserUpdate } from './dtos/user-update.dto';
import { RoleToSet } from './dtos/role-to-set.dto';
import { UserRegistration } from 'src/auth/dtos/user-registration.dto';
import { ApiMessages } from 'src/shared/constants';
import { AuthMessages } from 'src/auth/other/auth-constants';
import { MessageHelper } from 'src/shared/services/message-helper';
import { RoleUtils } from 'src/auth/role/role-utils';
import { RoleSectionHelper } from 'src/auth/role/role-section';
import { RolePermissionHelper } from 'src/auth/role/role-permission';

@Injectable()
export class UserService {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(UserEntity)
    private userEntity: typeof UserEntity,
    @InjectModel(UserRoleEntity)
    private userRoleEntity: typeof UserRoleEntity,
  ) {}

  private getPasswordHash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * Checks if user with given id exists.
   * If it does not, will throw NotFoundException.
   *
   * @param userId Id of the user to verify.
   */
  private async verifyUserExistence(userId: number): Promise<void> {
    const user = await this.findUserById(userId, false);
    if (!user)
      throw new NotFoundException(
        MessageHelper.replaceParameters(ApiMessages.OBJECT_NOT_FOUND, 'User'),
      );
  }

  /**
   * Get user by where condition.
   *
   * @param where Query parameters.
   * @param includeUserRoles Should include user roles?
   * @returns User object or null.
   */
  private async findUserWhere(
    where: any,
    includeUserRoles: boolean,
  ): Promise<UserEntity | null> {
    const query: any = { where };
    if (includeUserRoles) query.include = [{ model: UserRoleEntity }];
    const user = await this.userEntity.findOne<UserEntity>(query);
    return user ? user.get({ plain: true }) : null;
  }

  /**
   * Get user by id.
   *
   * @param id Id of the user to get.
   * @param includeUserRoles Optionally include user roles (default: true).
   * @returns User object or null.
   */
  async findUserById(
    id: number,
    includeUserRoles: boolean = true,
  ): Promise<UserEntity | null> {
    const where = { id };
    return await this.findUserWhere(where, includeUserRoles);
  }

  /**
   * Get user by email.
   *
   * @param email Email of the user to get.
   * @param includeUserRoles Optionally include user roles (default: true).
   * @returns User object or null.
   */
  async findUserByEmail(
    email: string,
    includeUserRoles: boolean = true,
  ): Promise<UserEntity | null> {
    const where = { [USER_COLUMN.email]: email };
    return await this.findUserWhere(where, includeUserRoles);
  }

  /**
   * Updates user data.
   *
   * @param userId Id of the user to update.
   * @param userUpdate Data to set on the user.
   * @returns Count of affected records.
   */
  async updateUser(userId: number, userUpdate: UserUpdate): Promise<number> {
    const userData: UserEntityProperties = {
      [USER_COLUMN.firstName]: userUpdate.firstName,
      [USER_COLUMN.lastName]: userUpdate.lastName,
      [USER_COLUMN.email]: userUpdate.email,
    };
    const affectedCount = await this.userEntity.update(userData, {
      where: { id: userId },
    });
    return affectedCount[0];
  }

  /**
   * Updates user roles.
   *
   * @param userId User id for which roles will be updated.
   * @param rolesToSet Roles to add or preserve, the rest will be removed.
   */
  async updateUserRoles(
    userId: number,
    rolesToSet: RoleToSet[],
  ): Promise<boolean> {
    await this.verifyUserExistence(userId);

    const stringifyRole = RoleUtils.stringifyRole;

    const transaction = await this.sequelize.transaction();
    try {
      const currentRoles: UserRoleEntity[] = await this.userRoleEntity.findAll({
        where: { [USER_ROLE_COLUMN.userId]: userId },
        raw: true,
        transaction,
      });

      const currentRolesAsString: string[] = currentRoles.map((r) =>
        stringifyRole(r),
      );
      const rolesToSetAsString: string[] = rolesToSet.map((r) =>
        stringifyRole(r),
      );

      // Prepare roles to add.
      const newRolesToAdd: RoleToSet[] = rolesToSet.filter(
        (nr) => !currentRolesAsString.includes(stringifyRole(nr)),
      );
      const rolesToAdd: UserRoleEntityProperties[] = newRolesToAdd.map(
        (r): UserRoleEntityProperties => ({
          [USER_ROLE_COLUMN.userId]: userId,
          [USER_ROLE_COLUMN.section]: RoleSectionHelper.getNumber(r.section),
          [USER_ROLE_COLUMN.permission]: RolePermissionHelper.getNumber(
            r.permission,
          ),
        }),
      );

      // Prepare roles to remove.
      const rolesToRemove: UserRoleEntity[] = currentRoles.filter(
        (cr) => !rolesToSetAsString.includes(stringifyRole(cr)),
      );

      // Update roles.
      if (rolesToAdd.length > 0)
        await this.userRoleEntity.bulkCreate(rolesToAdd, { transaction });
      if (rolesToRemove.length > 0)
        await this.userRoleEntity.destroy({
          where: { id: rolesToRemove.map((r) => r.id) },
          transaction,
        });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Creates a new user.
   *
   * @param userReg New user data.
   * @returns Id of the new user.
   */
  async createUser(userReg: UserRegistration): Promise<number> {
    const existingUser = await this.findUserByEmail(userReg.email, false);
    if (existingUser) throw new ConflictException(AuthMessages.USER_EXISTS);

    const newUser: UserEntityProperties = {
      [USER_COLUMN.firstName]: userReg.firstName,
      [USER_COLUMN.lastName]: userReg.lastName,
      [USER_COLUMN.email]: userReg.email,
      [USER_COLUMN.password]: this.getPasswordHash(userReg.password),
    };
    const user = await this.userEntity.create(newUser);

    return user.id;
  }

  /**
   * Replaces existing password with new one.
   *
   * @param userId User id for which password needs to be changed.
   * @param newPassword New password to encrypt and store.
   * @returns Count of affected records.
   */
  async changeUserPassword(userId: number, newPassword: string) {
    const password = this.getPasswordHash(newPassword);
    const affectedCount = await this.userEntity.update(
      { [USER_COLUMN.password]: password },
      { where: { id: userId } },
    );
    return affectedCount[0];
  }
}
