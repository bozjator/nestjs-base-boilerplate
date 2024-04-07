import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { Environment } from './config/environment.enum';
import appConfig from 'src/config/app.config';

declare const PhusionPassenger: any;

/**
 * Apply CORS.
 *
 * https://docs.nestjs.com/security/cors
 *
 * @param app Nest application.
 * @param allowedOrigins String of allowed origins separated with comma.
 */
function setupCORS(app: NestFastifyApplication, allowedOrigins: string) {
  const origins = allowedOrigins
    .split(',')
    .filter((_) => !!_ && _.trim().length > 0)
    .map((_) => _.trim());
  app.enableCors({ origin: origins.length > 0 ? origins : '*' });
}

/**
 * Set global pipe for incoming data validation and transformation.
 *
 * https://docs.nestjs.com/techniques/validation
 * https://docs.nestjs.com/techniques/validation#transform-payload-objects
 *
 * @param app Nest application.
 * @param disableErrorMessages If set to true, validation errors will not be returned to the client.
 */
function setupDataValidationAndTransformation(
  app: NestFastifyApplication,
  disableErrorMessages: boolean,
) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}

async function bootstrap() {
  await ConfigModule.envVariablesLoaded;
  const config = appConfig();
  const isEnvDevelopment = config.environment === Environment.development;

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(helmet);

  setupDataValidationAndTransformation(app, !isEnvDevelopment);
  setupCORS(app, config.allowed_origins);
  setupSwagger(app, config.environment, config.swagger_use_dark_theme);

  if (typeof PhusionPassenger !== 'undefined')
    app.listen('passenger', '127.0.0.1');
  else app.listen(config.port);
}
bootstrap();
