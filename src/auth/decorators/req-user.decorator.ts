import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInRequest } from '../models/user-in-request.model';

/**
 * Decorator to get currently logged in user object from the request.
 *
 * User was added into the request by AuthStrategyJwt.
 */
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInRequest => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
