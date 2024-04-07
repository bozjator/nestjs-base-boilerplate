import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccess {
  @ApiProperty()
  access_token: string;
}
