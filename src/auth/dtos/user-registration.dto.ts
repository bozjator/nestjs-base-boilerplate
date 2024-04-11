import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Password } from '../decorators/password.decorator';
import { ApiPropertyValidateLength } from 'src/shared/decorators/api-property-validate-length.decorator';
import { LENGTH_USER } from 'src/modules/user/entities/user.entity';

export class UserRegistration {
  @ApiPropertyValidateLength({ max: LENGTH_USER.firstName })
  @ApiProperty()
  firstName: string;

  @ApiPropertyValidateLength({ max: LENGTH_USER.lastName })
  @ApiProperty()
  lastName: string;

  @ApiPropertyValidateLength({ max: LENGTH_USER.email })
  @IsEmail()
  @ApiProperty()
  email: string;

  @Password()
  @ApiProperty()
  password: string;
}
