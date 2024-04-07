import { ApiProperty } from '@nestjs/swagger';
import { Password } from '../decorators/password.decorator';
import { CurrentPassword } from './current-password.dto';

export class ChangePassword extends CurrentPassword {
  @Password()
  @ApiProperty({ description: 'User new password.' })
  newPassword: string;
}
