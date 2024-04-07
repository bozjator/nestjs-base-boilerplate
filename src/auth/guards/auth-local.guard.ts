import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { authStrategyLocalName } from '../strategies/auth-local.strategy';

@Injectable()
export class AuthGuardLocal extends AuthGuard(authStrategyLocalName) {}
