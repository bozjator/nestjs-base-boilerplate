import * as Joi from 'joi';
import { Environment } from './environment.enum';

/**
 * Validation schema to check that environment variables are properly set.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(Environment))
    .default(Environment.production),

  // App config
  API_LOGGER_DB_TRANSPORT_ERROR_PATH: Joi.string().required(),
  API_APP_PORT: Joi.number().integer().required(),
  API_MONITORING_SECRET: Joi.string().required(),
  API_JWT_SECRET_KEY: Joi.string().required(),
  API_JWT_EXPIRES_IN: Joi.string().required(),
  API_ALLOWED_ORIGINS: Joi.string().allow('').required(),

  // Database config
  API_DATABASE_DIALECT: Joi.string().required(),
  API_DATABASE_USERNAME: Joi.string().required(),
  API_DATABASE_PASSWORD: Joi.string().required(),
  API_DATABASE_NAME: Joi.string().required(),
  API_DATABASE_HOST: Joi.string().required(),
  API_DATABASE_PORT: Joi.number().integer().required(),
  API_DATABASE_SSL: Joi.boolean().required(),

  // Business config
  API_BUSINESS_CONFIG_EXAMPLE: Joi.string().required(),
});
