import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import appConfig from 'src/config/app.config';
import { AuthTokenValidationService } from './guards/auth-token-validation.service';
import { UserModule } from 'src/modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthStrategyJwt } from './strategies/auth-jwt.strategy';
import { AuthStrategyLocal } from './strategies/auth-local.strategy';
import { UserJtiEntity } from './entities/user-jti.entity';
import { AuthService } from './auth.service';

async function getJwtModule(): Promise<DynamicModule> {
  await ConfigModule.envVariablesLoaded;
  const config = appConfig();
  return JwtModule.register({
    secret: config.jwt_secret_key,
    signOptions: { expiresIn: config.jwt_expires_in },
  });
}

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    getJwtModule(),
    SequelizeModule.forFeature([UserJtiEntity]),
  ],
  exports: [AuthTokenValidationService, AuthService],
  controllers: [AuthController],
  providers: [
    AuthTokenValidationService,
    AuthStrategyLocal,
    AuthStrategyJwt,
    AuthService,
  ],
})
export class AuthModule {}
