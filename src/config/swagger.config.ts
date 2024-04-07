import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { Environment } from './environment.enum';

/**
 * Setup swagger.
 *
 * https://docs.nestjs.com/openapi/introduction
 *
 * @param app Nest application.
 * @param environment App environment.
 * @param useDarkTheme Set it to true, to use dark swagger theme.
 */
export function setupSwagger(
  app: NestFastifyApplication,
  environment: string,
  useDarkTheme: boolean,
): void {
  if (environment === Environment.production) return;

  // Add posibility to authenticate through swagger.
  const securitySchemeObject: any = {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  };

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API end points')
    .setVersion('1.0')
    .addBearerAuth(securitySchemeObject)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const options: any = {};

  if (useDarkTheme) {
    const theme = new SwaggerTheme();
    options.customCss = theme.getBuffer(SwaggerThemeNameEnum.DARK);
  }

  SwaggerModule.setup('api', app, document, options);
}
