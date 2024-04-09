import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import {
  UserColumn,
  UserEntity,
  UserEntityProperties,
} from './entities/user.entity';
import {
  UserRoleColumn,
  UserRoleEntity,
  UserRoleEntityProperties,
} from './entities/user-role.entity';
import { UserUpdate } from './dtos/user-update.dto';
import { RoleToAdd } from './dtos/role-to-add.dto';
import { UserRegistration } from 'src/auth/dtos/user-registration.dto';
import { ApiMessages } from 'src/shared/constants';
import { AuthMessages } from 'src/auth/other/auth-constants';
import { MessageHelper } from 'src/shared/services/message-helper';
import { SharedFunctions } from 'src/shared/services/shared-functions';

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
    const user = await this.findUserById(userId);
    if (!user)
      throw new NotFoundException(
        MessageHelper.replaceParameters(ApiMessages.OBJECT_NOT_FOUND, 'User'),
      );
  }

  /**
   * Get user by where condition.
   *
   * @param where Query parameters.
   * @returns User object or null.
   */
  private async findUserWhere(where: any): Promise<UserEntity | null> {
    const user = await this.userEntity.findOne<UserEntity>({
      include: [{ model: UserRoleEntity }],
      where,
    });
    return user ? user.get({ plain: true }) : null;
  }

  /**
   * Get user by id.
   *
   * @param id Id of the user to get.
   * @returns User object or null.
   */
  async findUserById(id: number): Promise<UserEntity | null> {
    const where = { id };
    return await this.findUserWhere(where);
  }

  /**
   * Get user by email.
   *
   * @param email Email of the user to get.
   * @returns User object or null.
   */
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const where = { [UserColumn.email]: email };
    return await this.findUserWhere(where);
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
      firstName: userUpdate.firstName,
      lastName: userUpdate.lastName,
      email: userUpdate.email,
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
   * @param roles Roles to add or preserve, the rest will be removed.
   */
  async updateUserRoles(userId: number, roles: RoleToAdd[]): Promise<boolean> {
    await this.verifyUserExistence(userId);

    const roleToString = SharedFunctions.roleToString;

    const transaction = await this.sequelize.transaction();
    try {
      const currentRoles: UserRoleEntity[] = await this.userRoleEntity.findAll({
        where: { [UserRoleColumn.userId]: userId },
        raw: true,
        transaction,
      });

      const currentRolesAsString: string[] = currentRoles.map((r) =>
        roleToString(r),
      );
      const rolesAsString: string[] = roles.map((r) => roleToString(r));

      // Prepare roles to add.
      const rolesToAdd: RoleToAdd[] = roles.filter(
        (nr) => !currentRolesAsString.includes(roleToString(nr)),
      );
      const toAdd: UserRoleEntityProperties[] = rolesToAdd.map(
        (r): UserRoleEntityProperties => ({
          userId: userId,
          section: r.section,
          permission: r.permission,
        }),
      );

      // Prepare roles to remove.
      const rolesToRemove: UserRoleEntity[] = currentRoles.filter(
        (cr) => !rolesAsString.includes(roleToString(cr)),
      );
      const rolesIdsToRemove: number[] = rolesToRemove.map((r) => r.id);

      // Update roles.
      if (toAdd.length > 0) {
        await this.userRoleEntity.bulkCreate(toAdd, { transaction });
      }
      if (rolesIdsToRemove.length > 0) {
        await this.userRoleEntity.destroy({
          where: { id: rolesIdsToRemove },
          transaction,
        });
      }

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
    const existingUser = await this.findUserByEmail(userReg.email);
    if (existingUser) throw new ConflictException(AuthMessages.USER_EXISTS);

    const newUser: UserEntityProperties = {
      firstName: userReg.firstName,
      lastName: userReg.lastName,
      email: userReg.email,
      password: this.getPasswordHash(userReg.password),
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
      { password },
      { where: { id: userId } },
    );
    return affectedCount[0];
  }
}