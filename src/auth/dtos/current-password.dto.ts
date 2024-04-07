import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CurrentPassword {
  @IsNotEmpty()
  @ApiProperty({ description: 'User current password.' })
  currentPassword: string;
}
