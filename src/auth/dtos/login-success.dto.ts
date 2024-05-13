import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/dtos/user.dto';

export class LoginSuccess {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: User;
}
