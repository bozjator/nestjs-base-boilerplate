import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV,
  logger_db_transport_error_path:
    process.env.API_LOGGER_DB_TRANSPORT_ERROR_PATH,
  swagger_use_dark_theme: process.env.API_SWAGGER_DARK_THEME === 'true',
  port: parseInt(process.env.API_APP_PORT),
  monitoring_secret: process.env.API_MONITORING_SECRET,
  jwt_secret_key: process.env.API_JWT_SECRET_KEY,
  jwt_expires_in: process.env.API_JWT_EXPIRES_IN,
  allowed_origins: process.env.API_ALLOWED_ORIGINS,
}));
