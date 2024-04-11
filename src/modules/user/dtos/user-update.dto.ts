import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { CurrentPassword } from 'src/auth/dtos/current-password.dto';
import { ApiPropertyValidateLength } from 'src/shared/decorators/api-property-validate-length.decorator';
import { LENGTH_USER } from '../entities/user.entity';

export class UserUpdate extends CurrentPassword {
  @ApiPropertyValidateLength({ max: LENGTH_USER.email })
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiPropertyValidateLength({ max: LENGTH_USER.firstName })
  @ApiProperty()
  firstName: string;

  @ApiPropertyValidateLength({ max: LENGTH_USER.lastName })
  @ApiProperty()
  lastName: string;
}
