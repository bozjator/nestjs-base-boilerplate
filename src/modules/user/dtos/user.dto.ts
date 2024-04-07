import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class User {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  constructor(user: UserEntity) {
    if (!user) return;

    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}
