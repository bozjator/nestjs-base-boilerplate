import { ConfigModule, registerAs } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Environment } from './environment.enum';
import appConfig from './app.config';

const databaseConfig = registerAs('database', () => ({
  dialect: process.env.API_DATABASE_DIALECT,
  username: process.env.API_DATABASE_USERNAME,
  password: process.env.API_DATABASE_PASSWORD,
  name: process.env.API_DATABASE_NAME,
  host: process.env.API_DATABASE_HOST,
  port: parseInt(process.env.API_DATABASE_PORT),
  ssl: process.env.API_DATABASE_SSL === 'true',
}));

/**
 * Prepares sequelize configuration.
 *
 * https://docs.nestjs.com/techniques/database#sequelize-integration
 *
 * @returns Sequelize options object.
 */
export async function getSequelizeOptions(): Promise<SequelizeModuleOptions> {
  await ConfigModule.envVariablesLoaded;
  const dbConfig = databaseConfig();
  const config = appConfig();
  const isEnvDevelopment = config.environment === Environment.development;

  const sequelizeOptions: SequelizeModuleOptions = {
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.name,
    models: [],
    autoLoadModels: true,
    synchronize: isEnvDevelopment, // If true, it will create tables on start if they do not exists.
    define: {
      timestamps: true, // Create and query createdAt & updatedAt tables columns.
    },
    logging: isEnvDevelopment ? console.log : false,
  };

  if (dbConfig.ssl) {
    sequelizeOptions.ssl = true;
    sequelizeOptions.dialectOptions = {
      ssl: {
        require: true,
      },
    };
  }

  return sequelizeOptions;
}
