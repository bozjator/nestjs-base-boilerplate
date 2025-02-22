# NestJS base boilerplate for API projects

Production ready boilerplate project for [NestJS](https://nestjs.com/) applications.

## Features

- Using [Fastify](https://docs.nestjs.com/techniques/performance)
- Security: [helmet](https://docs.nestjs.com/security/helmet#use-with-fastify) and [CORS](https://docs.nestjs.com/security/cors) applied
- [Config service](https://docs.nestjs.com/techniques/configuration#using-the-configservice) for environment variables (with validation on startup to check if all needed env vars are set)
- Global validation and transformation pipe (use decorators of [class-validatior](https://docs.nestjs.com/pipes#class-validator) lib in your DTOs)
- [Swagger](https://docs.nestjs.com/openapi/introduction) (OpenAPI) configured
- Database setup with [Sequelize](https://docs.nestjs.com/techniques/database#sequelize-integration) ORM
- Global exception catcher (which then logs them through the logger)
- Logger (logs are stored into database or into a file if logging into db fails, logging into console if in development environmment)
- Users with roles
- Authentication and authorization
  - Use decorator `@ReqUser` to get currently logged in user object with id and roles.
  - Use decorator `@AuthUser` to protect routes and pass role (section & permission) as parameter if role to access a resource is needed.
  - Use decorator `@CacheControlHeader` to let browser know that caching a resource should take 'Authorization' header into account.
  - User roles are store inside JWT token, in the 'roles' property. This way you don't need to query API to get user roles, but can just get them from his access token.
  - You will have to implement adding / removing user roles based on your business logic. There is the `/user/{id}/roles` endpoint, which makes possible that user with role `all.manage` can manage other users roles.

## Authentication and authorization implementation

Every created JWT (JSON Web Token) contains JTI (JWT ID), which is also stored in the database table `user_jti`.  
When JWT access token is received by the API:

- it will take JTI from the token and user-agent request header to get platform & browser and
- then check if this JTI is in the `user_jti` table and that platform & browser match the stored values.

That way API is in control of valid tokens and can disable a token at any point, by removing JTI from the `user_jti` table.

For example, when a user is assigned new roles, API will remove all his JTIs to make all existing JWTs with old roles invalid, forcing this user to log in again, to get new roles stored in his new JWT token.  
Or when user thinks that any of his tokens were compromised or he forgot to logout on some computer to which he does not have access any more, he can simply call `/auth/logout-everywhere` endpoint to remove all his JTIs.

JWT refresh token strategy is not implemented.

### Roles (section & permission)

When you use `@AuthUser` decorator with a role, e.g. `@AuthUser(RoleSection.all, RolePermission.manage)`, swagger document will show, under the responses section, the required role as `403 Forbidden (required role: all.manage)`.

To add new section or permission for user role:

- add new value to the enum `RoleSection` or `RolePermission` and
- add mapping, enum value to number, to `roleSectionMap` or `rolePermissionMap`.

We need to map enum values to numbers because we store role section and permission as a number in database.
If we would store them as enum, we would need to update table schema every time when new section or permission value is added to the enum.  
Mapping enum values to numbers must be done explicitly, so that adding / removing / reordering enum values would not cause any problems.

<br><br>

# Installation

To build and run this project you need to install [Nest CLI](https://docs.nestjs.com/cli/overview)

```bash
# Nest CLI
$ npm i -g @nestjs/cli

# Project packages
$ npm install
```

### Running the app

```bash
# Watch mode (will restart app on file changes)
$ npm run start:dev

# Debug mode (will start with watch and debug flag)
# To debug the app start this command with VS Code debugger.
$ npm run start:debug
```

### Building the app

```bash
# Build app
$ npm run build
```

After the build is done, the app files will be in the `dist` folder.

### Upgrading packages

Use ncu package to check and upgrade package.json dependencies to the latest versions.  
https://www.npmjs.com/package/npm-check-updates

```bash
# Install globally
$ npm install -g npm-check-updates

# See packages current versions and their new versions
$ ncu

# Upgrade all packages to the newest version
$ ncu -u

# Now that package.json was updated install packages
$ npm install
```

<br><br>

# Setup

Before running this project, ensure that database (e.g. MySQL) server is installed and running.  
Create database (scheme) with a name that you will then set in the `.env` file.

Copy and rename file `.env.example` into `.env`, then change the values inside, suited for your environment.  
Once you run the API in development environment, database tables will be created.

Once the app is running, in development environment, you can access Swagger on the `/api` endpoint.  
This endpoint name is set in the `setupSwagger` configuration function.

<br><br>

# Development information

### Exception logger

Exception logger, `AppLoggerService` service, will log request objects together with exception info.  
Request objects can have sensitive properties and headers, which must be specified in the service, so that they will be removed.

<br><br>

# Other information

### Exception logger

There is the env variable `API_LOGGER_DB_TRANSPORT_ERROR_PATH` which holds the path and file name for storing logger database transport errors. You must create this file and make sure that app can write into it.

### Monitoring endpoints

To be able to access monitoring endpoints, you must set proper header on a request.  
The header name is the ona that is set in the `MonitoringAuthGuard` guard, see the `MONITORING_SECRET_HEADER_NAME` constant.  
The value that you must send for this header is the one that you set in the env variable `API_MONITORING_SECRET`.  
Use [Logboard](https://github.com/bozjator/logboard) project to see logs.
