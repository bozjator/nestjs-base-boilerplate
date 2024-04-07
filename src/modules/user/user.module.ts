import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UserRoleEntity } from './entities/user-role.entity';

@Module({
  imports: [SequelizeModule.forFeature([UserEntity, UserRoleEntity])],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
