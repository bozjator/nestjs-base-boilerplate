import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export const authStrategyLocalName = 'auth-strategy-local';

/**
 * Passport local strategy for executing user login verification.
 */
@Injectable()
export class AuthStrategyLocal extends PassportStrategy(
  Strategy,
  authStrategyLocalName,
) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * Passport will call this function to verify login credentials of a user.
   * If valid (if user is returned), it will add user object into the request.
   *
   * NOTE: it is triggered by using auth guard with this local strategy
   * (AuthLocalStrategy) on the login API endpoint.
   *
   * @param email User email credential for login.
   * @param password User password credential for login.
   * @returns User object if valid, otherwise throws NotFound exception.
   */
  async validate(email: string, password: string): Promise<UserEntity> {
    const user: UserEntity = await this.authService.validateUser(password, {
      email,
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
