import { ApiProperty } from '@nestjs/swagger';

export class Roles {
  @ApiProperty({ type: [String] })
  sections: string[];

  @ApiProperty({ type: [String] })
  permissions: string[];
}
